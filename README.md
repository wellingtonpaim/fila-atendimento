# Q-Manager — Sistema de Gestão de Filas

![CI/CD](https://github.com/wellingtonpaim/fila-atendimento/actions/workflows/ci.yml/badge.svg)
[![PWA](https://img.shields.io/badge/PWA-Instalável-purple.svg)](https://web.dev/progressive-web-apps/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/Licença-MIT-green.svg)](LICENSE)

Plataforma web para gerenciamento inteligente de filas de atendimento. Permite que clínicas, hospitais, órgãos públicos e qualquer unidade de atendimento organizem suas filas, chamem pacientes em painéis públicos em tempo real e acompanhem métricas de desempenho pelo dashboard.

---

## O que o Q-Manager faz

- **Organiza filas por setor**: cada fila pertence a um setor e a uma unidade de atendimento, com suporte a prioridade e retorno
- **Chama pacientes em tempo real**: painéis públicos (TVs, monitores) atualizam automaticamente via WebSocket quando um paciente é chamado, com vocalização do nome pelo navegador
- **Dashboard analítico**: gráficos de tempo médio de espera, produtividade por profissional, horários de pico e fluxo de atendimentos
- **Cadastro completo de clientes**: com busca por CPF, nome, e-mail e telefone; endereço preenchido automaticamente via CEP (integração ViaCEP)
- **Controle de acesso por perfil**: administradores gerenciam tudo; usuários operam o atendimento; parceiros externos acessam apenas analytics
- **Instalável no celular**: funciona como aplicativo (PWA) sem precisar de loja de aplicativos

---

## Arquitetura em um olhar

```
Navegador / Celular
        │  HTTPS
        ▼
    [ nginx ]  ──── serve frontend (React SPA + PWA)
        │       ──── proxy /api, /auth  →  [ Spring Boot ]  ──  [ PostgreSQL ]
        │       ──── proxy /ws          →  [ Spring Boot ]  (WebSocket STOMP)
        │
   Cloudflare Tunnel (opcional)
   URL pública válida sem certificado manual
```

A stack completa sobe com um único comando Docker Compose — sem precisar instalar Java, Node.js ou PostgreSQL na máquina.

---

## Pré-requisitos

- **Docker** e **Docker Compose** instalados
- Portas **80** e **443** liberadas no roteador (roteadas para a máquina onde roda o compose)
- Arquivo `.env` na raiz (veja o modelo em `.env.example`)

---

## Subindo a aplicação

```bash
# 1. Clone o repositório
git clone https://github.com/wellingtonpaim/fila-atendimento.git
cd fila-atendimento

# 2. Copie e preencha as variáveis de ambiente
cp .env.example .env
# edite o .env com seu IP público, credenciais de banco e e-mail

# 3. Gere o certificado SSL (necessário apenas no primeiro uso)
bash scripts/generate-certs.sh

# 4. Suba a aplicação
docker compose up -d

# 5. Acompanhe os logs (opcional)
docker compose logs -f
```

A aplicação estará disponível em `https://SEU_IP_PUBLICO`.

---

## Acessando pelo celular — duas formas

### Forma 1 — Cloudflare Tunnel (recomendada, zero configuração)

Sem instalar certificado no celular. O Cloudflare cria uma URL pública com HTTPS válido e reconhecido por qualquer navegador ou dispositivo.

```bash
# Sobe a aplicação com o tunnel ativo
docker compose --profile tunnel up -d

# Aguarde ~10 segundos e obtenha a URL pública
docker logs qmanager-cloudflared 2>&1 | grep -o 'https://[^ ]*trycloudflare.com'
```

Você receberá uma URL no formato `https://xxxxx-xxxxx.trycloudflare.com`. Acesse pelo celular — nenhuma configuração adicional necessária.

> A URL muda sempre que o container `cloudflared` é reiniciado. Para uma URL fixa e persistente, crie uma conta gratuita em [cloudflare.com](https://www.cloudflare.com) e configure um Named Tunnel.

---

### Forma 2 — IP público com certificado (acesso permanente)

Instale o certificado da CA gerado pelo script uma única vez no celular. Depois o acesso é sempre pela mesma URL `https://SEU_IP`.

**Android**
1. Transfira o arquivo `nginx/ssl/ca.crt` para o celular
2. Configurações → Segurança → Instalar certificado → Selecione o arquivo
3. Nomeie como `QManager CA` e confirme

**iOS / iPadOS**
1. Transfira o `ca.crt` para o iPhone (AirDrop, e-mail ou cabo)
2. Configurações → Geral → VPN e Gerenciamento de Dispositivo → Instale o perfil
3. Configurações → Geral → Sobre → Confiar em certificados raiz → ative para `QManager CA`

---

## Instalando como aplicativo (PWA)

Após acessar a URL no navegador do celular:

**Android (Chrome)**
Menu ⋮ → "Adicionar à tela inicial" → Instalar

**iOS (Safari)**
Botão de compartilhar ↑ → "Adicionar à Tela de Início" → Adicionar

O Q-Manager será instalado como aplicativo nativo com ícone na tela inicial.

---

## Primeiros passos

### 1. Acesso inicial

Um usuário administrador padrão é criado automaticamente na primeira execução (credenciais definidas no arquivo `.env` ou na migration `V014`). Acesse `https://SEU_HOST/login`.

### 2. Configure a estrutura básica

Na tela **Gestão do Sistema**, crie na seguinte ordem:

1. **Unidade de Atendimento** — representa a clínica, hospital ou posto (ex.: "UBS Centro")
2. **Setor** — divisão interna da unidade (ex.: "Triagem", "Pediatria")
3. **Fila** — vinculada a um setor (ex.: "Consultas Gerais")
4. **Painel** — associe filas ao painel que será exibido na TV/monitor

### 3. Adicione usuários

Crie usuários com perfil **USUARIO** para os atendentes e recepcionistas. Cada usuário faz login selecionando a unidade em que vai trabalhar.

### 4. Cadastre clientes

Em **Entrada em Fila**, busque o cliente pelo CPF ou cadastre um novo. O endereço é preenchido automaticamente ao digitar o CEP.

### 5. Abra o painel público

No módulo de **Painéis**, copie o link do painel e abra em um monitor ou TV do local de atendimento. Ele se conecta automaticamente e exibe as chamadas em tempo real, com vocalização do nome do paciente.

### 6. Inicie o atendimento

No **Painel Profissional**, clique em "Chamar Próximo" para chamar o próximo da fila. O painel público atualiza instantaneamente.

---

## API para Parceiros Externos

O Q-Manager disponibiliza acesso controlado aos dados de analytics para sistemas externos. Um usuário com perfil **PARCEIRO** acessa apenas os endpoints de dashboard (somente leitura) com o mesmo fluxo de autenticação JWT.

Endpoints disponíveis:

| Endpoint | Descrição |
|---|---|
| `GET /api/dashboard/tempo-medio-espera` | Tempo médio de espera por fila |
| `GET /api/dashboard/produtividade` | Atendimentos por profissional |
| `GET /api/dashboard/horarios-pico` | Intervalos de maior demanda |
| `GET /api/dashboard/fluxo-pacientes` | Volume de entradas e saídas |

A collection Postman `qmanager-parceiros.postman_collection.json` (raiz do repositório) contém todas as requisições prontas para uso.

---

## Comandos úteis

```bash
# Ver status dos containers
docker compose ps

# Ver logs de um serviço específico
docker compose logs -f backend
docker compose logs -f nginx

# Parar tudo
docker compose down

# Parar e apagar os dados do banco
docker compose down -v

# Rebuild de um serviço específico
docker compose up -d --build backend

# Subir com Cloudflare Tunnel
docker compose --profile tunnel up -d

# URL do tunnel ativo
docker logs qmanager-cloudflared 2>&1 | grep trycloudflare
```

---

## Estrutura do repositório

```
fila-atendimento/
├── backend/          # API REST Spring Boot (Java 21)
├── frontend/         # SPA React + TypeScript + PWA
├── nginx/            # Configuração do reverse proxy e SSL
├── scripts/          # Scripts de geração de certificados
├── .github/          # Workflows CI/CD (GitHub Actions)
├── docker-compose.yml
├── .env.example
└── qmanager-parceiros.postman_collection.json
```

Documentação detalhada de cada camada:
- [Backend — API REST](backend/README.md)
- [Frontend — Interface Web](frontend/README.md)

---

## Licença

MIT — veja o arquivo [LICENSE](LICENSE).

---

*Desenvolvido como projeto acadêmico — UNIVESP.*
