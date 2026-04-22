#!/usr/bin/env bash
# =============================================================
#  update-ip.sh — Execute sempre que o IP público mudar
#
#  O que faz:
#   1. Lê PUBLIC_IP do .env raiz
#   2. Regenera o certificado SSL assinado pela CA local
#   3. Recria os containers com as novas variáveis de ambiente
#
#  Pré-requisito: ./scripts/setup-ca.sh já foi executado
# =============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SSL_DIR="$ROOT_DIR/nginx/ssl"
ENV_FILE="$ROOT_DIR/.env"

# ── Detecta o comando docker compose disponível ─────────────
if docker compose version &>/dev/null 2>&1; then
  DC="docker compose"
else
  DC="docker-compose"
fi

# ── Lê variáveis do .env ─────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Arquivo .env não encontrado em $ROOT_DIR"
  exit 1
fi

set -o allexport
# shellcheck disable=SC1090
source <(grep -v '^#' "$ENV_FILE" | grep -v '^[[:space:]]*$')
set +o allexport

if [ -z "${PUBLIC_IP:-}" ] || [ "$PUBLIC_IP" = "SEU_IP_AQUI" ]; then
  echo "❌ Defina PUBLIC_IP no arquivo .env antes de continuar."
  echo "   Dica: seu IP público atual é: $(curl -s ifconfig.me 2>/dev/null || echo 'não disponível')"
  exit 1
fi

if [ ! -f "$SSL_DIR/ca.key" ]; then
  echo "❌ CA não encontrada. Execute primeiro: ./scripts/setup-ca.sh"
  exit 1
fi

# ── Gera certificado para o IP atual ─────────────────────────
echo "🌐 Regenerando certificado SSL para IP: $PUBLIC_IP"

TMPDIR_CERT=$(mktemp -d)
trap 'rm -rf "$TMPDIR_CERT"' EXIT

cat > "$TMPDIR_CERT/cert.ext" <<EOF
[req]
req_extensions = v3_req
distinguished_name = req_distinguished_name
prompt = no

[req_distinguished_name]
CN = ${PUBLIC_IP}
O  = Q-Manager
C  = BR

[v3_req]
subjectAltName = IP:${PUBLIC_IP}
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
EOF

openssl genrsa -out "$SSL_DIR/server.key" 2048 2>/dev/null

openssl req -new \
  -key "$SSL_DIR/server.key" \
  -out "$TMPDIR_CERT/server.csr" \
  -config "$TMPDIR_CERT/cert.ext" 2>/dev/null

openssl x509 -req -days 365 \
  -in "$TMPDIR_CERT/server.csr" \
  -CA "$SSL_DIR/ca.crt" \
  -CAkey "$SSL_DIR/ca.key" \
  -CAcreateserial \
  -out "$SSL_DIR/server.crt" \
  -extfile "$TMPDIR_CERT/cert.ext" \
  -extensions v3_req 2>/dev/null

echo "✅ Certificado gerado para $PUBLIC_IP (válido 365 dias)"

# ── Recria containers com novas variáveis de ambiente ────────
echo ""
echo "🔄 Aplicando mudanças nos containers..."
cd "$ROOT_DIR"

# --no-build: usa imagens já existentes localmente ou do GHCR
# Se as imagens ainda não existirem, faz o build automaticamente
$DC up -d --no-build nginx backend 2>/dev/null || {
  echo "⚠️  Imagens não encontradas. Fazendo build inicial (pode demorar alguns minutos)..."
  $DC up -d nginx backend
}

echo ""
echo "✅ Pronto!"
echo ""
echo "   Acesse no celular: https://${PUBLIC_IP}"
echo ""
echo "   Se o navegador mostrar aviso de certificado:"
echo "   → O arquivo nginx/ssl/ca.crt já foi instalado no celular?"
echo "     (Veja as instruções em: ./scripts/setup-ca.sh)"
