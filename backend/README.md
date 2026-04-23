# Q-Manager – Backend (API REST)

![Java CI with Maven](https://github.com/wellingtonpaim/fila-atendimento/actions/workflows/ci.yml/badge.svg)

[![Java](https://img.shields.io/badge/Java-21-blue.svg)](https://www.java.com)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/API_Docs-Swagger-orange.svg)](/swagger-ui/index.html)
[![JWT](https://img.shields.io/badge/Security-JWT-black.svg)](https://jwt.io/)
[![WebSocket](https://img.shields.io/badge/Real_Time-WebSocket-yellow.svg)](https://spring.io/guides/gs/messaging-stomp-websocket/)


## Sumário
- [Visão Geral](#visão-geral)
- [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
- [Requisitos, Configuração e Execução](#requisitos-configuração-e-execução)
  - [Variáveis e Propriedades de Ambiente](#variáveis-e-propriedades-de-ambiente)
  - [Como executar](#como-executar)
  - [Testes e Cobertura](#testes-e-cobertura)
  - [Documentação (Swagger)](#documentação-swagger)
- [Padrões de Resposta e Códigos HTTP](#padrões-de-resposta-e-códigos-http)
- [Autenticação e Segurança](#autenticação-e-segurança)
  - [Fluxo de Registro e Confirmação de E-mail](#fluxo-de-registro-e-confirmação-de-e-mail)
  - [Fluxo “Esqueci minha senha”](#fluxo-esqueci-minha-senha)
  - [Propriedades relacionadas ao Auth](#propriedades-relacionadas-ao-auth)
  - [Regras de autorização por método HTTP](#regras-de-autorização-por-método-http)
  - [CORS (origens permitidas e headers expostos)](#cors-origens-permitidas-e-headers-expostos)
- [Paginação da API](#paginação-da-api)
- [Recursos da API por Módulo](#recursos-da-api-por-módulo)
  - [Autenticação (/auth)](#autenticação-auth)
  - [Unidades de Atendimento (/api/unidades-atendimento)](#unidades-de-atendimento-apiunidades-atendimento)
  - [Setores (/api/setores)](#setores-apisetores)
  - [Filas (/api/filas)](#filas-apifilas)
  - [Entrada na Fila (/api/entrada-fila)](#entrada-na-fila-apientrada-fila)
  - [Painéis (/api/paineis)](#painéis-apipaineis)
  - [Clientes (/api/clientes)](#clientes-apiclientes)
  - [Usuários (/api/usuarios)](#usuários-apiusuarios)
  - [Dashboard (/api/dashboard)](#dashboard-apidashboard)
  - [E-mail (/api/email)](#e-mail-apiemail)
  - [WebSocket](#websocket)
- [Integração WebSocket (Frontend React)](#integração-websocket-frontend-react)
- [Frontend: Implementando “Esqueci minha senha”](#frontend-implementando-esqueci-minha-senha)
- [Guia Rápido para o Frontend](#guia-rápido-para-o-frontend)
- [Estrutura de Dados Principais](#estrutura-de-dados-principais)
- [Comandos Úteis](#comandos-úteis)
- [Contribuições e Licença](#contribuições-e-licença)

---

## Visão Geral
O Q-Manager é uma plataforma web para gerenciamento inteligente de filas e atendimento, com foco inicial em unidades de saúde e arquitetura flexível para outros domínios. Fornece APIs REST seguras, comunicação em tempo real para painéis e mecanismos completos de autenticação, incluindo confirmação de e-mail no cadastro e recuperação de senha pelo fluxo “Esqueci minha senha”.

## Arquitetura e Tecnologias
- Backend: Java 21, Spring Boot 3
- Segurança: Spring Security + JWT
- Persistência: Spring Data JPA (Hibernate) + PostgreSQL
- Migrações: Flyway
- Tempo real: Spring WebSocket (STOMP)
- Templates de e-mail/páginas: Thymeleaf
- Documentação: SpringDoc OpenAPI (Swagger UI)
- Qualidade: JUnit 5 + JaCoCo

---

## Requisitos, Configuração e Execução
### Variáveis e Propriedades de Ambiente
Banco/E-mail (exemplos):
- Use variáveis de ambiente para sobrescrever as propriedades do Spring.
- Em desenvolvimento (profile dev):
  - `spring.datasource.url=${DB_HOST}` → Espera uma URL JDBC completa.
    - Exemplo: `jdbc:postgresql://localhost:5432/postgres?currentSchema=fila_atendimento`
  - `spring.datasource.username=${DB_USER}`
  - `spring.datasource.password=${DB_PASSWORD}`
- Em produção (profile prod):
  - `spring.datasource.url=${DB-HOST}`
  - `spring.datasource.username=${DB-USER}`
  - `spring.datasource.password=${DB-PASSWORD}`
  - Observação: os nomes acima com hífen refletem o arquivo `application-prod.properties` atual. Se preferir padronizar com underscore (`DB_HOST`, etc.), ajuste o arquivo de propriedades ou suas variáveis de ambiente de acordo.
- SMTP (Gmail):
  - `spring.mail.username`, `spring.mail.password`
  - `email.sender.impl` (padrão: `gmailSmtpService`) – seleciona a implementação de envio de e-mails.

Integração e Links (backend → e-mails → frontend):
- `app.base-url` (default dev: `http://localhost:8899`) – Base pública do backend (usada para montar links enviados por e-mail de confirmação).
- `app.qmanager.login-url` – URL de login do frontend usada na página de confirmação.
  - dev (por env): `${QMANAGER_LOGIN_URL}` (default interno: `http://localhost:3000/login`)
  - prod (ex.): `https://app.qmanager.example.com/login`
- `app.qmanager.error-url` – URL de erro/retentativa no frontend (página de confirmação).
  - dev (por env): `${QMANAGER_ERROR_URL}` (default interno: `http://localhost:3000/login?retry=true`)
  - prod (ex.): `https://app.qmanager.example.com/login?retry=true`
- `app.qmanager.reset-url` – URL da tela de redefinição de senha no frontend (usada no e-mail “Esqueci minha senha”).
  - dev (default interno): `http://localhost:3000/reset-password`
  - prod (ex.): `https://app.qmanager.example.com/reset-password`

Outras propriedades úteis (opcional):
- Servidor: `server.port` (default: `8899`)
- Painel público (timings):
  - `painel.publico.tempo-exibicao-segundos` (default: `15`)
  - `painel.publico.repeticoes` (default: `3`)
  - `painel.publico.intervalo-repeticao-segundos` (default: `5`)

Perfis de execução:
- `src/main/resources/application-dev.properties`
- `src/main/resources/application-prod.properties`

### Como executar
```bash
./mvnw spring-boot:run
```
API: http://localhost:8899

### Testes e Cobertura
```bash
./mvnw clean test jacoco:report
```
Relatório: `target/site/jacoco/index.html`

### Documentação (Swagger)
- URL: http://localhost:8899/swagger-ui/index.html

---

## Padrões de Resposta e Códigos HTTP
Formato base (`ApiResponse<T>`):
```json
{
  "success": true,
  "message": "Descrição da operação",
  "data": { }
}
```
Códigos de status comuns: 200, 400, 401, 403, 404, 409, 500.

---

## Autenticação e Segurança
- JWT stateless
- Controle de acesso por unidade de atendimento
- Perfis: ADMINISTRADOR, USUARIO
- Confirmação de e-mail obrigatória para ativação de contas
- Recuperação de senha via token temporário enviado por e-mail

### Fluxo de Registro e Confirmação de E-mail
- `POST /auth/register` – Cria usuário (inativo) e envia e-mail de confirmação com link.
- `GET /auth/confirmar?token=...` – Página HTML (Thymeleaf) com resultado da confirmação:
  - Sucesso: botão “Ir para Q-Manager” leva ao `app.qmanager.login-url` com UTMs para analytics.
  - Erro: botão “Tentar novamente” leva a `app.qmanager.error-url` com UTMs.
- Templates:
  - Página: `templates/auth/confirmacao-resultado.html`
  - E-mail: `templates/email/confirmacao-cadastro.html`

### Fluxo “Esqueci minha senha”
1) Solicitação do reset
- `POST /auth/forgot-password` com body `{ "email": "usuario@dominio.com" }`.
- Resposta é sempre positiva (mesma mensagem) para evitar enumeração de e-mails.
- Se o usuário existir e estiver ativo, o backend:
  - Revoga tokens anteriores (`deleteByUsuario`).
  - Cria novo `PasswordResetToken` com expiração.
  - Envia e-mail com link para o frontend: `app.qmanager.reset-url?token=<TOKEN>&utm_source=qmanager-backend&utm_medium=reset-email&utm_campaign=password_reset`.
- Template de e-mail: `templates/email/redefinicao-senha.html`.

2) Validação do token (frontend)
- `GET /auth/reset-password/validate?token=...` → 200 OK com `data=true` se válido; 400 com `data=false` se inválido/expirado.

3) Redefinição da senha
- `POST /auth/reset-password` com body `{ "token": "...", "novaSenha": "..." }`.
- Se o token for válido e não expirado:
  - Atualiza a senha do usuário (hash com `PasswordEncoder`).
  - Revoga todos os tokens de reset do usuário.

Observações importantes:
- Token inválido → 400: `"Token de redefinição inválido!"`
- Token expirado → 400: `"Token expirado"`
- O link no e-mail aponta para o frontend; o backend não exibe formulário de troca de senha.

### Propriedades relacionadas ao Auth
- `app.base-url`: base pública do backend (construção do link de confirmação).
- `spring.mail.username`: remetente do e-mail.
- `app.qmanager.login-url`, `app.qmanager.error-url`: navegação após confirmação.
- `app.qmanager.reset-url`: tela do frontend para redefinição de senha.

### Regras de autorização por método HTTP
Conforme a configuração de segurança:
- Público (sem JWT):
  - `OPTIONS /**` (preflight CORS)
  - `POST /auth/register`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/reset-password/validate`, `GET /auth/confirmar`, `GET /api/unidades-atendimento/public/login`, Swagger (`/swagger-ui/**`, `/v3/api-docs/**`) e handshake WebSocket (`/ws/**`).
- Autenticado (JWT com roles USUARIO ou ADMINISTRADOR):
  - `GET /**` e `POST /**` (exceto os públicos acima). Inclui `GET /api/paineis/publico/{id}`.
- Apenas ADMINISTRADOR:
  - `PUT /**`, `DELETE /**` e `PATCH /api/usuarios/{id}/promover`.

### CORS (origens permitidas e headers expostos)
- Origens permitidas (dev): `http://localhost:*`, `http://127.0.0.1:*`, `http://192.168.1.*:*`.
- Métodos: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- Headers permitidos (dev): `*` (aceita qualquer header; útil para cabeçalhos customizados como `x-unidade-id`).
- Headers expostos: `Authorization`, `X-Total-Count`, `X-Total-Pages`, `X-Page`, `X-Page-Size`, `Content-Range`.
- Observação: o endpoint de handshake WebSocket (`/ws`) é público, mas o frame CONNECT do STOMP deve incluir `Authorization: Bearer <token>`.

#### CORS para Produção (recomendado)
Para produção, restrinja as origens tanto no REST quanto no WebSocket. Exemplos:

- REST (classe `WebSecurityConfig`):
  - Substitua as origens de desenvolvimento por domínios reais do seu frontend.
  - Liste cabeçalhos explicitamente (inclua `Authorization`, `Content-Type`, `X-Requested-With` e quaisquer customizados como `x-unidade-id`).

Exemplo (ilustrativo):
```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOriginPatterns(List.of(
        "https://app.qmanager.example.com",
        "https://monitor.qmanager.example.com"
    ));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "x-unidade-id"));
    config.setAllowCredentials(true);
    config.setExposedHeaders(List.of("Authorization", "X-Total-Count", "X-Total-Pages", "X-Page", "X-Page-Size", "Content-Range"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

- WebSocket (classe `WebSocketConfig`):
  - Em produção, prefira limitar as origens do SockJS/STOMP ao(s) domínio(s) do frontend.

Exemplo (ilustrativo):
```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOriginPatterns(
                "https://app.qmanager.example.com",
                "https://monitor.qmanager.example.com"
            )
            .withSockJS();
}
```

Checklist Prod:
- Use HTTPS em frontend e backend.
- Se houver proxy/reverse proxy (Nginx/Traefik), habilite o upgrade de WebSocket (Upgrade: websocket) e preserve o header `Authorization`.
- Certifique-se de que os domínios do proxy também constam nas origens permitidas.
- Tokens do painel têm validade: trate expiração no frontend (solicitar novo link pelo dashboard).

---

## Paginação da API
A paginação é opcional via `page` (base 0) e `size`.
- Se não enviados: retorna lista completa.
- Se enviados: retorna o slice com headers de paginação (`X-Total-Count`, `X-Total-Pages`, `X-Page`, `X-Page-Size`, `Content-Range`).

Endpoints com paginação (amostra): `GET /api/usuarios`, `GET /api/clientes`, `GET /api/setores`, `GET /api/unidades-atendimento`, `GET /api/paineis`, `GET /api/filas`, `GET /api/entrada-fila/aguardando/{filaId}`.

---

## Recursos da API por Módulo

### Autenticação (/auth)
- `POST /auth/login` – Autenticação com validação por unidade. Params: `username`, `password`, `unidadeAtendimentoId`.
- `POST /auth/register` – Registro público; envia e-mail de confirmação.
- `GET /auth/confirmar?token=...` – Página HTML de confirmação (resultado + botões com UTMs).
- `DELETE /auth/delete/{email}` – Desativar usuário por e-mail.
- `POST /auth/forgot-password` – Inicia fluxo “Esqueci minha senha”.
- `GET /auth/reset-password/validate?token=...` – Verifica validade do token.
- `POST /auth/reset-password` – Define nova senha usando o token.

### Unidades de Atendimento (/api/unidades-atendimento)
- `GET /api/unidades-atendimento` – Listar (paginação opcional)
- `GET /api/unidades-atendimento/{id}` – Buscar por ID
- `GET /api/unidades-atendimento/nome/{nome}` – Buscar por nome (paginação opcional)
- `POST /api/unidades-atendimento` – Criar
- `PUT /api/unidades-atendimento/{id}` – Substituir
- `PATCH /api/unidades-atendimento/{id}` – Atualização parcial
- `DELETE /api/unidades-atendimento/{id}` – Desativar
- `GET /api/unidades-atendimento/public/login` – Listar (público) para tela de login

### Setores (/api/setores)
- `GET /api/setores` – Listar (paginação opcional)
- `GET /api/setores/{id}` – Buscar por ID
- `GET /api/setores/nome/{nome}` – Buscar por nome (paginação opcional)
- `POST /api/setores` – Criar
- `PUT /api/setores/{id}` – Substituir
- `PATCH /api/setores/{id}` – Atualização parcial
- `DELETE /api/setores/{id}` – Desativar

### Filas (/api/filas)
- `GET /api/filas` – Listar todas (paginação opcional)
- `GET /api/filas/unidade/{unidadeId}` – Listar por unidade (paginação opcional)
- `GET /api/filas/{id}` – Buscar por ID
- `POST /api/filas` – Criar
- `PATCH /api/filas/{id}` – Atualização parcial
- `DELETE /api/filas/{id}` – Desativar

### Entrada na Fila (/api/entrada-fila)
- `POST /api/entrada-fila` – Adicionar cliente à fila
- `POST /api/entrada-fila/chamar-proximo` – Chamar próximo (`filaId`, `usuarioId`, `guiche`)
- `POST /api/entrada-fila/finalizar/{entradaFilaId}` – Finalizar atendimento
- `POST /api/entrada-fila/cancelar/{entradaFilaId}` – Cancelar atendimento (mantém o registro marcado como `CANCELADO` e define `dataHoraSaida`). Body opcional: `{ "motivoCancelamento": "string (máx. 500)" }`.
- `POST /api/entrada-fila/encaminhar/{entradaFilaIdOrigem}` – Encaminhar para outra fila
- `GET /api/entrada-fila/aguardando/{filaId}` – Aguardando (paginação opcional)

### Painéis (/api/paineis)
- `GET /api/paineis?unidadeAtendimentoId={id}` – Listar (paginação opcional; parâmetro obrigatório unidade)
- `GET /api/paineis/{id}?unidadeAtendimentoId={unidadeAtendimentoId}` – Buscar por ID (valida unidade)
- `GET /api/paineis/unidade/{unidadeId}` – Listar por unidade (paginação opcional)
- `GET /api/paineis/publico/{id}` – Buscar público por ID (requer JWT; sem parâmetro de unidade)
- `POST /api/paineis` – Criar
- `PUT /api/paineis/{id}` – Atualizar
- `DELETE /api/paineis/{id}` – Desativar
- `POST /api/paineis/{painelId}/filas/{filaId}` – Associar fila
- `DELETE /api/paineis/{painelId}/filas/{filaId}` – Remover fila

### Clientes (/api/clientes)
- `GET /api/clientes` – Listar todos (paginação opcional)
- `GET /api/clientes/{id}` – Buscar por ID
- `GET /api/clientes/cpf/{cpf}` – Buscar por CPF (retorna único)
- `GET /api/clientes/nome/{nome}` – Buscar por nome (semelhante, paginação opcional)
- `GET /api/clientes/email/{email}` – Buscar por e-mail (parcial, paginação opcional)
- `GET /api/clientes/telefone/{telefone}` – Buscar por telefone (parcial, paginação opcional)
- `POST /api/clientes` – Criar
- `PUT /api/clientes/{id}` – Substituir
- `PATCH /api/clientes/{id}` – Atualização parcial
- `DELETE /api/clientes/{id}` – Desativar

### Usuários (/api/usuarios)
- `GET /api/usuarios` – Listar (paginação opcional)
- `GET /api/usuarios/{id}` – Buscar por ID
- `GET /api/usuarios/email/{email}` – Buscar por e-mail
- `POST /api/usuarios` – Criar
- `PUT /api/usuarios/{id}` – Substituir
- `PATCH /api/usuarios/{id}` – Atualização parcial
- `PATCH /api/usuarios/{id}/promover` – Promover para ADMINISTRADOR
- `DELETE /api/usuarios/{id}` – Desativar

### Dashboard (/api/dashboard)
- `GET /api/dashboard/tempo-medio-espera`
- `GET /api/dashboard/produtividade`
- `GET /api/dashboard/horarios-pico`
- `GET /api/dashboard/fluxo-pacientes`

Parâmetros obrigatórios para todos os endpoints de Dashboard:
- `unidadeId` (UUID)
- `inicio` e `fim` em ISO-8601 (ex.: `2025-01-31T08:00:00`)

### E-mail (/api/email)
- `POST /api/email/send` – Envio de e-mail (serviço)

### WebSocket
Tópicos STOMP:
- `/topic/painel-publico/{painelId}` – Atualizações para um painel público (cada payload inclui `filaId`).
- `/topic/fila/{setorId}` – Atualizações para profissionais de um setor.

Observações:
- O handshake em `/ws` é público, mas o frame CONNECT do STOMP deve conter `Authorization: Bearer <token>`.
- O tópico público usa `painelId` (não `filaId`). Ajuste o frontend caso use o formato antigo.

#### WebSocket em Produção (origens permitidas)
- Alinhe o `setAllowedOriginPatterns` do endpoint `/ws` com os domínios reais do frontend (ver exemplo acima).
- Em ambientes mistos (subdomínios diferentes), liste cada domínio explicitamente.
- Evite `*` em produção quando `allowCredentials` estiver habilitado.

---

## Integração WebSocket (Frontend React)

### Visão Geral
O backend utiliza **Spring WebSocket** com protocolo **STOMP** sobre **SockJS** para comunicação em tempo real. A autenticação é obrigatória via JWT no frame CONNECT do STOMP.

### Configuração do Backend
- **Endpoint de handshake**: `/ws` (público, mas requer autenticação JWT no CONNECT)
- **Protocolo**: STOMP sobre SockJS
- **Message Broker**: Simple Broker com prefixo `/topic`
- **Origens permitidas**: `*` (ajustar para produção)
- **Autenticação**: JWT via header `Authorization: Bearer <token>` no frame CONNECT do STOMP

### Tópicos Disponíveis

#### 1. Painel Público: `/topic/painel-publico/{painelId}`
**Finalidade**: Exibir chamadas em painéis públicos (TVs/monitores para pacientes)

**Quando é emitido**: 
- Ao chamar próximo paciente (`POST /api/entrada-fila/chamar-proximo`)
- Ao finalizar atendimento (`POST /api/entrada-fila/finalizar/{entradaFilaId}`)
- Ao cancelar atendimento (`POST /api/entrada-fila/cancelar/{entradaFilaId}`)
- Ao encaminhar paciente (`POST /api/entrada-fila/encaminhar/{entradaFilaIdOrigem}`)

**Estrutura do payload**:
```json
{
  "filaId": "uuid-da-fila",
  "chamadaAtual": {
    "nomePaciente": "João Silva",
    "guicheOuSala": "Guichê 3",
    "dataHoraChamada": "2025-01-31T14:30:00"
  },
  "ultimasChamadas": [
    {
      "nomePaciente": "Maria Santos",
      "guicheOuSala": "Guichê 2",
      "dataHoraChamada": "2025-01-31T14:28:00"
    },
    {
      "nomePaciente": "Pedro Costa",
      "guicheOuSala": "Guichê 1",
      "dataHoraChamada": "2025-01-31T14:25:00"
    }
  ],
  "mensagemVocalizacao": "João Silva, compareça a Guichê 3!",
  "tempoExibicao": 15,
  "repeticoes": 3,
  "intervaloRepeticao": 5,
  "sinalizacaoSonora": true
}
```

**Campos do payload**:
- `filaId` (UUID): ID da fila que teve atualização
- `chamadaAtual` (ChamadaDTO | null): Chamada em destaque no momento
- `ultimasChamadas` (List<ChamadaDTO>): Histórico de chamadas recentes
- `mensagemVocalizacao` (string): Texto para síntese de voz (vazio se não houver nova chamada)
- `tempoExibicao` (int): Segundos para exibir cada chamada (padrão: 15)
- `repeticoes` (int): Número de repetições da chamada (padrão: 3)
- `intervaloRepeticao` (int): Segundos entre repetições (padrão: 5)
- `sinalizacaoSonora` (boolean): Se deve emitir som/vocalização (true apenas quando há nova chamada)

#### 2. Painel Profissional: `/topic/fila/{setorId}`
**Finalidade**: Atualizar interface de profissionais (recepcionistas, atendentes)

**Quando é emitido**: 
- Nos mesmos eventos do painel público (chamadas, finalizações, cancelamentos, encaminhamentos)

**Estrutura do payload**:
```json
{
  "setorId": "uuid-do-setor",
  "filaAtual": [
    {
      "id": "uuid-entrada-fila",
      "status": "AGUARDANDO",
      "prioridade": true,
      "isRetorno": false,
      "dataHoraEntrada": "2025-01-31T14:00:00",
      "dataHoraChamada": null,
      "dataHoraSaida": null,
      "guicheOuSalaAtendimento": null,
      "cliente": {
        "id": "uuid-cliente",
        "nome": "Ana Paula",
        "cpf": "123.456.789-00",
        "email": "ana@example.com",
        "telefone": "(11) 98765-4321",
        "dataNascimento": "1990-05-15",
        "ativo": true
      },
      "fila": {
        "id": "uuid-fila",
        "nome": "Consultas Gerais",
        "ativo": true,
        "setorId": "uuid-setor"
      },
      "usuarioResponsavelId": null
    }
  ]
}
```

**Campos do payload**:
- `setorId` (UUID): ID do setor
- `filaAtual` (List<EntradaFilaResponseDTO>): Lista completa de entradas na fila do setor

**Status possíveis**: `AGUARDANDO`, `CHAMADO`, `EM_ATENDIMENTO`, `FINALIZADO`, `CANCELADO`

### Implementação no Frontend React

#### 1. Instalação de Dependências

```bash
npm install sockjs-client @stomp/stompjs
# ou
yarn add sockjs-client @stomp/stompjs
```

#### 2. Hook Customizado para WebSocket

Crie um arquivo `src/hooks/useWebSocket.js`:

```javascript
import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

/**
 * Hook para gerenciar conexão WebSocket com autenticação JWT
 * 
 * @param {string} token - JWT token para autenticação
 * @param {string} baseUrl - URL base do backend (ex: 'http://localhost:8899')
 * @returns {Object} - { client, connected, error, subscribe, unsubscribe }
 */
export const useWebSocket = (token, baseUrl = 'http://localhost:8899') => {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const subscriptionsRef = useRef(new Map());

  useEffect(() => {
    if (!token) {
      console.warn('WebSocket: Token JWT não fornecido');
      return;
    }

    // Criar cliente STOMP
    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('[STOMP Debug]', str);
      },
      reconnectDelay: 5000, // Tentar reconectar a cada 5 segundos
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('✅ WebSocket conectado com sucesso');
        setConnected(true);
        setError(null);
      },
      
      onStompError: (frame) => {
        console.error('❌ Erro STOMP:', frame.headers['message']);
        console.error('Detalhes:', frame.body);
        setError(frame.headers['message'] || 'Erro na conexão WebSocket');
        setConnected(false);
      },
      
      onWebSocketError: (event) => {
        console.error('❌ Erro WebSocket:', event);
        setError('Erro na conexão WebSocket');
        setConnected(false);
      },
      
      onDisconnect: () => {
        console.log('🔌 WebSocket desconectado');
        setConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    // Cleanup ao desmontar
    return () => {
      if (client.active) {
        subscriptionsRef.current.forEach((subscription) => {
          subscription.unsubscribe();
        });
        subscriptionsRef.current.clear();
        client.deactivate();
      }
    };
  }, [token, baseUrl]);

  /**
   * Inscrever-se em um tópico
   * @param {string} topic - Caminho do tópico (ex: '/topic/painel-publico/uuid')
   * @param {function} callback - Função a ser chamada ao receber mensagem
   * @returns {string|null} - ID da subscrição ou null se falhar
   */
  const subscribe = useCallback((topic, callback) => {
    const client = clientRef.current;
    
    if (!client || !client.connected) {
      console.warn('WebSocket: Cliente não conectado. Aguardando conexão...');
      // Retry após conexão
      const checkInterval = setInterval(() => {
        if (clientRef.current?.connected) {
          clearInterval(checkInterval);
          subscribe(topic, callback);
        }
      }, 500);
      return null;
    }

    if (subscriptionsRef.current.has(topic)) {
      console.warn(`WebSocket: Já inscrito em ${topic}`);
      return topic;
    }

    try {
      const subscription = client.subscribe(topic, (message) => {
        try {
          const payload = JSON.parse(message.body);
          console.log(`📨 Mensagem recebida em ${topic}:`, payload);
          callback(payload);
        } catch (err) {
          console.error('Erro ao parsear mensagem WebSocket:', err);
        }
      });

      subscriptionsRef.current.set(topic, subscription);
      console.log(`✅ Inscrito no tópico: ${topic}`);
      return topic;
    } catch (err) {
      console.error(`Erro ao inscrever no tópico ${topic}:`, err);
      return null;
    }
  }, []);

  /**
   * Cancelar inscrição de um tópico
   * @param {string} topic - Caminho do tópico
   */
  const unsubscribe = useCallback((topic) => {
    const subscription = subscriptionsRef.current.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(topic);
      console.log(`❌ Desinscrição do tópico: ${topic}`);
    }
  }, []);

  return {
    client: clientRef.current,
    connected,
    error,
    subscribe,
    unsubscribe,
  };
};
```

#### 3. Componente de Painel Público

Exemplo `src/components/PainelPublico.jsx`:

```javascript
import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const PainelPublico = ({ painelId, token }) => {
  const { connected, error, subscribe, unsubscribe } = useWebSocket(
    token,
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:8899'
  );
  
  const [chamadaAtual, setChamadaAtual] = useState(null);
  const [ultimasChamadas, setUltimasChamadas] = useState([]);
  const [vocalizando, setVocalizando] = useState(false);

  useEffect(() => {
    if (!connected || !painelId) return;

    const topic = `/topic/painel-publico/${painelId}`;
    
    const handleMessage = (payload) => {
      // Atualizar estado com dados recebidos
      setChamadaAtual(payload.chamadaAtual);
      setUltimasChamadas(payload.ultimasChamadas || []);

      // Sinalização sonora (se habilitada)
      if (payload.sinalizacaoSonora && payload.mensagemVocalizacao) {
        reproduzirVocalizacao(
          payload.mensagemVocalizacao,
          payload.repeticoes || 3,
          payload.intervaloRepeticao || 5
        );
      }
    };

    subscribe(topic, handleMessage);

    return () => {
      unsubscribe(topic);
    };
  }, [connected, painelId, subscribe, unsubscribe]);

  const reproduzirVocalizacao = (mensagem, repeticoes, intervalo) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API não suportada neste navegador');
      return;
    }

    setVocalizando(true);
    let count = 0;

    const falar = () => {
      if (count >= repeticoes) {
        setVocalizando(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(mensagem);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        count++;
        if (count < repeticoes) {
          setTimeout(falar, intervalo * 1000);
        } else {
          setVocalizando(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    falar();
  };

  if (error) {
    return <div className="error">❌ Erro na conexão: {error}</div>;
  }

  if (!connected) {
    return <div className="loading">🔄 Conectando ao servidor...</div>;
  }

  return (
    <div className="painel-publico">
      <h1>Painel de Chamadas</h1>
      
      {/* Chamada Atual */}
      {chamadaAtual && (
        <div className={`chamada-atual ${vocalizando ? 'vocalizando' : ''}`}>
          <h2>Chamada Atual</h2>
          <div className="paciente">{chamadaAtual.nomePaciente}</div>
          <div className="guiche">🚪 {chamadaAtual.guicheOuSala}</div>
          <div className="hora">
            {new Date(chamadaAtual.dataHoraChamada).toLocaleTimeString('pt-BR')}
          </div>
        </div>
      )}

      {/* Últimas Chamadas */}
      {ultimasChamadas.length > 0 && (
        <div className="ultimas-chamadas">
          <h3>Últimas Chamadas</h3>
          <ul>
            {ultimasChamadas.map((chamada, index) => (
              <li key={index}>
                <span className="nome">{chamada.nomePaciente}</span>
                <span className="guiche">{chamada.guicheOuSala}</span>
                <span className="hora">
                  {new Date(chamada.dataHoraChamada).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PainelPublico;
```

#### 4. Componente de Painel Profissional

Exemplo `src/components/PainelProfissional.jsx`:

```javascript
import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const PainelProfissional = ({ setorId, token }) => {
  const { connected, error, subscribe, unsubscribe } = useWebSocket(
    token,
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:8899'
  );
  
  const [filaAtual, setFilaAtual] = useState([]);

  useEffect(() => {
    if (!connected || !setorId) return;

    const topic = `/topic/fila/${setorId}`;
    
    const handleMessage = (payload) => {
      setFilaAtual(payload.filaAtual || []);
    };

    subscribe(topic, handleMessage);

    return () => {
      unsubscribe(topic);
    };
  }, [connected, setorId, subscribe, unsubscribe]);

  const getStatusBadge = (status) => {
    const statusMap = {
      AGUARDANDO: { label: 'Aguardando', color: 'blue' },
      CHAMADO: { label: 'Chamado', color: 'orange' },
      EM_ATENDIMENTO: { label: 'Em Atendimento', color: 'green' },
      FINALIZADO: { label: 'Finalizado', color: 'gray' },
      CANCELADO: { label: 'Cancelado', color: 'red' },
    };
    
    const config = statusMap[status] || { label: status, color: 'gray' };
    return (
      <span className={`badge badge-${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (error) {
    return <div className="error">❌ Erro na conexão: {error}</div>;
  }

  if (!connected) {
    return <div className="loading">🔄 Conectando ao servidor...</div>;
  }

  return (
    <div className="painel-profissional">
      <h2>Fila de Atendimento - Setor</h2>
      <div className="contador">
        Total na fila: {filaAtual.length}
      </div>

      <table className="fila-table">
        <thead>
          <tr>
            <th>Prioridade</th>
            <th>Paciente</th>
            <th>CPF</th>
            <th>Hora Entrada</th>
            <th>Status</th>
            <th>Guichê/Sala</th>
          </tr>
        </thead>
        <tbody>
          {filaAtual.map((entrada) => (
            <tr key={entrada.id} className={entrada.prioridade ? 'prioridade' : ''}>
              <td>
                {entrada.prioridade && <span className="priority-icon">⚡</span>}
                {entrada.isRetorno && <span className="return-icon">🔄</span>}
              </td>
              <td>{entrada.cliente.nome}</td>
              <td>{entrada.cliente.cpf}</td>
              <td>
                {new Date(entrada.dataHoraEntrada).toLocaleTimeString('pt-BR')}
              </td>
              <td>{getStatusBadge(entrada.status)}</td>
              <td>{entrada.guicheOuSalaAtendimento || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filaAtual.length === 0 && (
        <div className="empty-state">
          Nenhum paciente na fila no momento
        </div>
      )}
    </div>
  );
};

export default PainelProfissional;
```

#### 5. Tratamento de Erros Comuns

**Erro: "Invalid JWT token" ou "Missing Authorization header"**
- **Causa**: Token JWT não está sendo enviado corretamente no frame CONNECT
- **Solução**: Verifique se o token está no formato `Bearer <token>` nos `connectHeaders`

**Erro: Conexão não estabelecida**
- **Causa**: Backend não está rodando ou CORS mal configurado
- **Solução**: 
  - Verifique se o backend está acessível em `http://localhost:8899`
  - Confirme que a origem do frontend está nas origens permitidas do CORS

**Erro: Mensagens não são recebidas**
- **Causa**: Tópico incorreto ou cliente não inscrito
- **Solução**: 
  - Verifique se o tópico está no formato correto: `/topic/painel-publico/{painelId}` ou `/topic/fila/{setorId}`
  - Confirme que `painelId` ou `setorId` são UUIDs válidos
  - Verifique os logs do console para mensagens de subscrição

**Erro: "Já inscrito em {topic}"**
- **Causa**: Tentativa de inscrição duplicada no mesmo tópico
- **Solução**: Cancele a inscrição anterior antes de criar nova (`unsubscribe` no cleanup do useEffect)

#### 6. Boas Práticas

1. **Sempre desinscrever ao desmontar componente**:
   ```javascript
   useEffect(() => {
     const topic = `/topic/painel-publico/${painelId}`;
     subscribe(topic, handleMessage);
     
     return () => {
       unsubscribe(topic); // Importante!
     };
   }, [painelId]);
   ```

2. **Validar dados recebidos**:
   ```javascript
   const handleMessage = (payload) => {
     if (!payload || typeof payload !== 'object') {
       console.error('Payload inválido:', payload);
       return;
     }
     // Processar payload
   };
   ```

3. **Implementar reconexão automática**: O hook já implementa reconexão com `reconnectDelay: 5000`

4. **Usar variáveis de ambiente**:
   ```javascript
   const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8899';
   ```

5. **Feedback visual de conexão**:
   ```javascript
   {!connected && <div className="connection-status">🔄 Reconectando...</div>}
   {error && <div className="error">❌ {error}</div>}
   ```

#### 7. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto React:

```env
REACT_APP_API_BASE_URL=http://localhost:8899
```

Para produção (`.env.production`):

```env
REACT_APP_API_BASE_URL=https://api.qmanager.example.com
```

#### 8. TypeScript (Opcional)

Se estiver usando TypeScript, defina as interfaces:

```typescript
// src/types/websocket.ts

export interface ChamadaDTO {
  nomePaciente: string;
  guicheOuSala: string;
  dataHoraChamada: string;
}

export interface PainelPublicoDTO {
  filaId: string;
  chamadaAtual: ChamadaDTO | null;
  ultimasChamadas: ChamadaDTO[];
  mensagemVocalizacao: string;
  tempoExibicao: number;
  repeticoes: number;
  intervaloRepeticao: number;
  sinalizacaoSonora: boolean;
}

export interface ClienteResponseDTO {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  ativo: boolean;
}

export interface FilaResponseDTO {
  id: string;
  nome: string;
  ativo: boolean;
  setorId: string;
}

export interface EntradaFilaResponseDTO {
  id: string;
  status: 'AGUARDANDO' | 'CHAMADO' | 'EM_ATENDIMENTO' | 'FINALIZADO' | 'CANCELADO';
  prioridade: boolean;
  isRetorno: boolean;
  dataHoraEntrada: string;
  dataHoraChamada: string | null;
  dataHoraSaida: string | null;
  guicheOuSalaAtendimento: string | null;
  cliente: ClienteResponseDTO;
  fila: FilaResponseDTO;
  usuarioResponsavelId: string | null;
}

export interface PainelProfissionalDTO {
  setorId: string;
  filaAtual: EntradaFilaResponseDTO[];
}
```

#### 9. Testes

Exemplo de teste com Jest e React Testing Library:

```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useWebSocket } from '../hooks/useWebSocket';

describe('useWebSocket', () => {
  it('deve conectar com token válido', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useWebSocket('valid-jwt-token', 'http://localhost:8899')
    );

    await waitForNextUpdate();

    expect(result.current.connected).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('deve falhar sem token', () => {
    const { result } = renderHook(() =>
      useWebSocket(null, 'http://localhost:8899')
    );

    expect(result.current.connected).toBe(false);
  });
});
```

### Resumo do Fluxo Completo

1. **Autenticação**: Frontend obtém JWT via `POST /auth/login`
2. **Conexão WebSocket**: Hook `useWebSocket` conecta a `/ws` com JWT no header `Authorization`
3. **Inscrição**: Componente se inscreve no tópico apropriado:
   - Painel Público: `/topic/painel-publico/{painelId}`
   - Painel Profissional: `/topic/fila/{setorId}`
4. **Recebimento**: Callback é invocado quando mensagem chega, atualizando o estado do componente
5. **Processamento**: UI é atualizada automaticamente (React re-renderiza)
6. **Limpeza**: Ao desmontar, `unsubscribe` cancela inscrição e `deactivate` fecha conexão

### Troubleshooting

| Problema | Possível Causa | Solução |
|----------|---------------|---------|
| Não conecta | Backend offline | Verificar se backend está rodando na porta 8899 |
| "Invalid JWT token" | Token expirado/inválido | Renovar token via login |
| Mensagens não chegam | Tópico errado | Verificar UUID do painel/setor |
| Múltiplas conexões | useEffect sem cleanup | Adicionar `unsubscribe` no return |
| CORS error | Origem não permitida | Adicionar origem no `WebSocketConfig.java` |
| Reconexão infinita | Token inválido permanentemente | Implementar refresh token ou logout |

### Recursos Adicionais

- [Documentação STOMP.js](https://stomp-js.github.io/stomp-websocket/)
- [SockJS Client](https://github.com/sockjs/sockjs-client)
- [Spring WebSocket Documentation](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## Evolução da Plataforma

Esta seção registra os avanços mais recentes da plataforma, que elevaram o projeto a um novo patamar de maturidade operacional.

### Implantação Containerizada (Docker Compose)

O backend passou a ser distribuído como imagem Docker, orquestrado junto ao banco de dados e ao servidor nginx via Docker Compose. O pipeline de CI/CD constrói e publica a imagem automaticamente no **GitHub Container Registry (GHCR)** a cada push na branch de produção.

Serviços na stack:

| Serviço   | Imagem                              | Função                             |
|-----------|-------------------------------------|------------------------------------|
| `db`      | `postgres`                          | Banco de dados PostgreSQL          |
| `backend` | `ghcr.io/wellingtonpaim/qmanager-backend` | API REST + WebSocket (STOMP/SockJS) |
| `nginx`   | `ghcr.io/wellingtonpaim/qmanager-nginx`   | Reverse proxy com terminação TLS   |

### CI/CD com GitHub Actions

O pipeline (`ci.yml`) é composto por quatro jobs sequenciais acionados a cada push ou pull request nas branches `main` e `homologacao`:

```
test-frontend → test-backend → build-push → deploy
```

- **test-backend**: executa `./mvnw verify` com Checkstyle e JUnit; falha bloqueia o pipeline
- **build-push**: constrói a imagem Docker e a publica no GHCR
- **deploy**: conecta via SSH ao servidor e executa `docker compose pull && docker compose up -d`

O job `deploy` só é acionado em push direto (não em pull requests).

### Integração com ViaCEP

Novo endpoint que consulta a [API pública ViaCEP](https://viacep.com.br) para auto-preenchimento de endereços no cadastro de clientes.

```
GET /api/cep/{cep}
```

- Validação de formato (exatamente 8 dígitos numéricos)
- Consulta ao serviço externo via `RestClient` do Spring
- Resposta padronizada no envelope `ApiResponse<CepResponseDTO>`

Exemplo de resposta:

```json
{
  "success": true,
  "message": "Endereço encontrado",
  "data": {
    "cep": "01001-000",
    "logradouro": "Praça da Sé",
    "complemento": "lado ímpar",
    "bairro": "Sé",
    "cidade": "São Paulo",
    "uf": "SP"
  }
}
```

Erros tratados:
- CEP com formato inválido → `400 Bad Request`
- CEP não encontrado (campo `erro: true` na resposta do ViaCEP) → `404 Not Found`
- Falha de conectividade com o ViaCEP → `404 Not Found` com mensagem descritiva

### Fornecimento de API de Análise de Dados para Terceiros

O Q-Manager disponibiliza acesso controlado aos dados de analytics para sistemas e parceiros externos por meio de um novo perfil de usuário: **PARCEIRO**.

#### Perfil de acesso

| Perfil | Escopo |
|---|---|
| `ADMINISTRADOR` | Acesso total |
| `USUARIO` | Acesso operacional |
| `PARCEIRO` | Somente leitura em `GET /api/dashboard/**` |

Qualquer outra rota retorna `403 Forbidden` para o perfil `PARCEIRO`.

#### Criação de usuário parceiro

Realizada pelo administrador via endpoint já existente:

```http
POST /api/usuarios
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "nomeUsuario": "Sistema Parceiro X",
  "email": "parceiro@empresa.com",
  "senha": "senha_segura",
  "categoria": "PARCEIRO"
}
```

#### Autenticação e consumo

O parceiro autentica-se normalmente com `POST /auth/login` (campo `unidadeAtendimentoId` pode ser `null`) e recebe um JWT. Com ele, acessa os quatro endpoints de analytics:

| Endpoint | Descrição |
|---|---|
| `GET /api/dashboard/tempo-medio-espera` | Tempo médio de espera por fila |
| `GET /api/dashboard/produtividade` | Atendimentos por profissional |
| `GET /api/dashboard/horarios-pico` | Intervalos de maior demanda |
| `GET /api/dashboard/fluxo-pacientes` | Volume de entradas, saídas e cancelamentos |

Parâmetros obrigatórios em todos: `unidadeId` (UUID), `inicio` e `fim` (ISO-8601).

#### Collection Postman

`qmanager-parceiros.postman_collection.json` na raiz do repositório contém as requisições pré-configuradas com variáveis de ambiente, captura automática de token e testes de validação de acesso.

### Ajuste de WebSocket para Ambiente Containerizado

Após a containerização, o proxy nginx precisou de dois ajustes para que o SockJS funcionasse corretamente atrás do reverse proxy:

1. **Header `Connection` dinâmico**: configurado via diretiva `map` do nginx, enviando `upgrade` apenas em conexões WebSocket reais e `close` nas requisições HTTP normais do SockJS (polling, `/ws/info`). Sem esse ajuste, o SockJS não conseguia completar a negociação de transporte.

2. **Configuração de origens**: `setAllowedOriginPatterns("*")` mantida para o ambiente containerizado (ajustar para domínios reais em produção pública).

---
