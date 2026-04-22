#!/usr/bin/env bash
# =============================================================
#  setup-ca.sh — Execução ÚNICA na primeira configuração
#
#  Cria uma Autoridade Certificadora (CA) local.
#  Depois instale o arquivo nginx/ssl/ca.crt no celular para
#  que ele confie automaticamente em todos os certificados
#  gerados por essa CA (incluindo os futuros, quando o IP mudar).
# =============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SSL_DIR="$ROOT_DIR/nginx/ssl"

mkdir -p "$SSL_DIR"

if [ -f "$SSL_DIR/ca.key" ]; then
  echo "⚠️  CA já existe em $SSL_DIR. Remova os arquivos ca.key/ca.crt para recriar."
  exit 0
fi

echo "🔐 Gerando Autoridade Certificadora local..."

openssl genrsa -out "$SSL_DIR/ca.key" 4096

openssl req -new -x509 -days 3650 \
  -key "$SSL_DIR/ca.key" \
  -out "$SSL_DIR/ca.crt" \
  -subj "/CN=Q-Manager Local CA/O=Estudo Local/C=BR"

echo ""
echo "✅ CA criada com sucesso!"
echo ""
echo "📱 PRÓXIMO PASSO — Instale o certificado CA no seu celular:"
echo "   Arquivo: $SSL_DIR/ca.crt"
echo ""
echo "   Android:"
echo "     1. Copie ca.crt para o celular (cabo USB, e-mail, etc.)"
echo "     2. Configurações → Segurança → Instalar certificado"
echo "     3. Selecione 'Certificado CA' e escolha o arquivo"
echo ""
echo "   iOS:"
echo "     1. Copie ca.crt para o celular"
echo "     2. Instale em Configurações → Geral → VPN e Gerenc. de Dispositivo"
echo "     3. Ative em Configurações → Geral → Sobre → Conf. de Confiança do Cert."
echo ""
echo "▶  Agora edite o PUBLIC_IP no .env e execute: ./scripts/update-ip.sh"
