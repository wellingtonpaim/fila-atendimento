/**
 * Configuração centralizada de URLs do backend.
 *
 * Em produção (via nginx), deixe VITE_API_URL e VITE_WS_URL vazios ou
 * com caminhos relativos — o nginx faz o roteamento automaticamente.
 * Assim, quando o IP público mudar, basta atualizar o .env raiz e
 * reiniciar o nginx; nenhum rebuild do frontend é necessário.
 */

/** URL base da API REST. Vazio = mesma origem (padrão em produção via nginx). */
const rawApiUrl = (import.meta.env.VITE_API_URL as string) ?? '';

/** URL base do WebSocket SockJS. Relativa = derivada de window.location. */
const rawWsUrl = (import.meta.env.VITE_WS_URL as string) ?? '';

/**
 * Resolve uma URL de WebSocket a partir de uma string que pode ser:
 *  - URL absoluta: "http(s)://host/ws"  → converte protocolo para ws(s)
 *  - Caminho relativo: "/ws"            → deriva do window.location atual
 *  - Vazio                              → assume "/ws" relativo
 */
function resolveWsUrl(url: string): string {
  if (!url || url.startsWith('/')) {
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? 'wss:'
      : 'ws:';
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost';
    const path = url || '/ws';
    return `${protocol}//${host}${path}`;
  }
  // URL absoluta: converte http(s) → ws(s)
  return url.replace(/^https?/, (m) => (m === 'https' ? 'wss' : 'ws'));
}

const BackendConfig = {
  /** URL base para chamadas REST. Ex: "" (relativa) ou "https://x.x.x.x" */
  apiBaseUrl: rawApiUrl,

  /** URL resolvida do WebSocket, sempre absoluta com protocolo ws(s). */
  get wsBaseUrl(): string {
    return resolveWsUrl(rawWsUrl);
  },

  /**
   * Adiciona token como query param (usado pelo painel público).
   */
  appendTokenQuery(url: string, token?: string): string {
    if (!token) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}token=${encodeURIComponent(token)}`;
  },

  /**
   * Converte protocolo http(s) → ws(s) em URLs absolutas.
   * URLs relativas são retornadas sem modificação.
   */
  toWs(url: string): string {
    if (url.startsWith('/') || !url) return url;
    return url.replace(/^https?/, (m) => (m === 'https' ? 'wss' : 'ws'));
  },
} as const;

export default BackendConfig;
