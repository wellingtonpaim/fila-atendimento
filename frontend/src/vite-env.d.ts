/// <reference types="vite/client" />

interface ImportMetaEnv {
  // URL base da API HTTP
  readonly VITE_API_URL: string
  // URL base do endpoint WS/SockJS (opcional; se ausente, deriva de API_URL + '/ws')

  // Preferência de transporte WebSocket; 'true' força SockJS, 'false' força nativo
  readonly VITE_WS_SOCKJS: string
}
