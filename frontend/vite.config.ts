import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
    },
    plugins: [
        react(),
        mode === 'development' &&
        componentTagger(),
        // Configuração do PWA adicionada aqui
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Q-Manager Pro',
                short_name: 'Q-Manager',
                description: 'Gestão Inteligente de Filas e Atendimento',
                theme_color: '#ffffff', // Você pode ajustar para a cor principal do seu tema escuro/claro
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: 'pwa-192x192.png', // Precisaremos colocar essa imagem na pasta public
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png', // E essa também
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    define: {
        global: 'window',
    },
    optimizeDeps: {
        include: ['@stomp/stompjs', 'sockjs-client'],
    },
}));