import { ChamadaWebSocket } from '@/types';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Mantém compatibilidade do tipo de callback
type WebSocketEventCallback = (data: ChamadaWebSocket) => void;

class WebSocketService {
  private static instance: WebSocketService;
  private client: Client | null = null;
  private subscriptions: Map<string, { sub?: StompSubscription; listeners: WebSocketEventCallback[] }> = new Map();
  private token: string | null = null;
  private connected = false;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private getWsBaseUrl(): string {
    // Preferir VITE_WS_URL; se ausente, derivar de VITE_API_URL + '/ws'; fallback para localhost
    const explicit = (import.meta.env.VITE_WS_URL as string | undefined) || '';
    if (explicit) return this.stripQuery(explicit);

    const apiBase = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8899';
    return this.stripQuery(`${apiBase.replace(/\/$/, '')}/ws`);
  }

  private appendTokenQuery(url: string): string {
    // Anexa token JWT na query (necessário para SockJS /ws/info). Se não houver token, não anexa nada.
    if (!this.token) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}token=${encodeURIComponent(this.token)}`;
  }

  private stripQuery(url: string): string {
    // Remove quaisquer query strings (ex.: '?token=painel-publico')
    const idx = url.indexOf('?');
    return idx >= 0 ? url.substring(0, idx) : url;
  }

  private toWs(url: string): string {
    // Converte http(s) -> ws(s) para WebSocket nativo
    if (url.startsWith('http://')) return 'ws://' + url.substring('http://'.length);
    if (url.startsWith('https://')) return 'wss://' + url.substring('https://'.length);
    // já é ws/wss
    return url;
  }

  connect(token?: string): void {
    this.token = token || null;

    if (this.client && this.connected) return;

    const base = this.getWsBaseUrl();
    // Seleção do transporte: respeita VITE_WS_SOCKJS quando definido; caso contrário, usa SockJS se houver token (autenticado), nativo se público
    const envPref = (import.meta.env.VITE_WS_SOCKJS ?? '').toString().toLowerCase();
    const defaultSockJS = !!this.token;
    const useSockJS = envPref === 'true' ? true : envPref === 'false' ? false : defaultSockJS;

    const webSocketFactory = () => {
      if (useSockJS) {
        const sockUrl = this.appendTokenQuery(base);
        if (import.meta.env.DEV) console.debug('[WS] SockJS ->', sockUrl);
        return new SockJS(sockUrl, undefined, {
          transportOptions: {
            'xhr-streaming': { withCredentials: false },
            'xhr-polling': { withCredentials: false },
          }
        } as any);
      }
      // Native WS: quando o backend usa SockJS com endpoint '/ws', o transporte WS nativo responde em '/ws/websocket'
      const nativeBase = base.endsWith('/websocket') ? base : `${base.replace(/\/$/, '')}/websocket`;
      const nativeUrl = this.appendTokenQuery(nativeBase);
      if (import.meta.env.DEV) console.debug('[WS] Native ->', this.toWs(nativeUrl));
      return new WebSocket(this.toWs(nativeUrl));
    };

    this.client = new Client({
      webSocketFactory,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => { if (import.meta.env.DEV) console.debug('[STOMP]', str); },
      // Envia Authorization no frame CONNECT (padrão aceito pelo Spring)
      connectHeaders: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      onConnect: () => {
        this.connected = true;
        this.subscriptions.forEach((entry, destination) => {
          if (!entry.sub) entry.sub = this.client!.subscribe(destination, (msg) => this.dispatch(destination, msg));
        });
      },
      onStompError: (frame) => {
        console.error('Erro STOMP:', frame.headers['message'], frame.body);
      },
      onWebSocketClose: () => { this.connected = false; },
      onWebSocketError: () => { this.connected = false; },
      onDisconnect: () => { this.connected = false; },
    });

    this.client.activate();
  }

  private dispatch(destination: string, message: IMessage) {
    try {
      const payload = JSON.parse(message.body);
      const entry = this.subscriptions.get(destination);
      if (!entry) return;
      entry.listeners.forEach((cb) => {
        try { cb(payload as ChamadaWebSocket); } catch (err) { console.error('Erro em listener de WebSocket:', err); }
      });
    } catch (err) {
      console.error('Erro ao processar mensagem STOMP:', err);
    }
  }

  subscribe(destination: string, callback: WebSocketEventCallback): () => void {
    if (!this.subscriptions.has(destination)) this.subscriptions.set(destination, { listeners: [] });
    const entry = this.subscriptions.get(destination)!;
    entry.listeners.push(callback);

    if (this.connected && !entry.sub && this.client) {
      entry.sub = this.client.subscribe(destination, (msg) => this.dispatch(destination, msg));
    }

    return () => {
      const e = this.subscriptions.get(destination);
      if (!e) return;
      const idx = e.listeners.indexOf(callback);
      if (idx >= 0) e.listeners.splice(idx, 1);
      if (e.listeners.length === 0) {
        try { e.sub?.unsubscribe(); } catch {}
        this.subscriptions.delete(destination);
      }
    };
  }

  disconnect(): void {
    try {
      this.subscriptions.forEach((e) => { try { e.sub?.unsubscribe(); } catch {} });
      this.subscriptions.clear();
      this.client?.deactivate();
    } finally {
      this.client = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return !!this.connected;
  }
}

export const websocketService = WebSocketService.getInstance();