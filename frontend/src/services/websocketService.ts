import { ChamadaWebSocket } from '@/types';

type WebSocketEventCallback = (data: ChamadaWebSocket) => void;

class WebSocketService {
    private static instance: WebSocketService;
    private socket: WebSocket | null = null;
    private listeners: Map<string, WebSocketEventCallback[]> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;

    private constructor() {}

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    connect(token: string): void {
        const wsUrl = import.meta.env.VITE_WS_URL;

        try {
            this.socket = new WebSocket(`${wsUrl}?token=${token}`);

            this.socket.onopen = () => {
                console.log('WebSocket conectado');
                this.reconnectAttempts = 0;
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.notifyListeners(data.topic, data.payload);
                } catch (error) {
                    console.error('Erro ao processar mensagem WebSocket:', error);
                }
            };

            this.socket.onerror = (error) => {
                console.error('Erro WebSocket:', error);
            };

            this.socket.onclose = () => {
                console.log('WebSocket desconectado');
                this.handleReconnect(token);
            };
        } catch (error) {
            console.error('Erro ao conectar WebSocket:', error);
        }
    }

    private handleReconnect(token: string): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

            setTimeout(() => {
                this.connect(token);
            }, this.reconnectDelay);
        } else {
            console.error('Máximo de tentativas de reconexão atingido');
        }
    }

    subscribe(topic: string, callback: WebSocketEventCallback): () => void {
        if (!this.listeners.has(topic)) {
            this.listeners.set(topic, []);
        }

        this.listeners.get(topic)!.push(callback);

        // Retorna função para cancelar a inscrição
        return () => {
            const callbacks = this.listeners.get(topic);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    private notifyListeners(topic: string, data: ChamadaWebSocket): void {
        const callbacks = this.listeners.get(topic);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.listeners.clear();
        this.reconnectAttempts = 0;
    }

    isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }
}

export const websocketService = WebSocketService.getInstance();