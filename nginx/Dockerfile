# =================================================================
#  Imagem nginx que já contém o frontend React compilado
#  Build context: raiz do projeto (para acessar frontend/ e nginx/)
# =================================================================

# Stage 1 — compila o frontend com Node
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copia só os manifests primeiro para aproveitar cache de layer
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

# Copia o restante do frontend e faz o build de produção
# URLs relativas: o nginx roteia para o backend na mesma origem
COPY frontend/ .
ENV VITE_API_URL=""
ENV VITE_WS_URL="/ws"
RUN npm run build

# Stage 2 — nginx serve os estáticos e aplica a config de proxy
FROM nginx:alpine
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
