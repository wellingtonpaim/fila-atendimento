# Q-Manager – Backend (API REST)

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
  - `POST /auth/register`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/reset-password/validate`, `GET /auth/confirmar`, `GET /api/unidades-atendimento/public/login`, Swagger (`/swagger-ui/**`, `/v3/api-docs/**`) e handshake WebSocket (`/ws/**`).
- Autenticado (JWT com roles USUARIO ou ADMINISTRADOR):
  - `GET /**` e `POST /**` (exceto os públicos acima).
- Apenas ADMINISTRADOR:
  - `PUT /**`, `DELETE /**` e `PATCH /api/usuarios/{id}/promover`.

### CORS (origens permitidas e headers expostos)
- Origens permitidas (dev): `http://localhost:*`, `http://192.168.1.6:*`.
- Métodos: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- Headers expostos: `Authorization`, `X-Total-Count`, `X-Total-Pages`, `X-Page`, `X-Page-Size`, `Content-Range`.
- Observação: o endpoint de handshake WebSocket (`/ws`) é público, mas o frame CONNECT do STOMP deve incluir `Authorization: Bearer <token>`.

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
- `POST /api/entrada-fila/cancelar/{entradaFilaId}` – Cancelar atendimento
- `POST /api/entrada-fila/encaminhar/{entradaFilaIdOrigem}` – Encaminhar para outra fila
- `GET /api/entrada-fila/aguardando/{filaId}` – Aguardando (paginação opcional)

### Painéis (/api/paineis)
- `GET /api/paineis?unidadeAtendimentoId={id}` – Listar (paginação opcional; parâmetro obrigatório unidade)
- `GET /api/paineis/{id}?unidadeAtendimentoId={unidadeAtendimentoId}` – Buscar por ID (valida unidade)
- `GET /api/paineis/unidade/{unidadeId}` – Listar por unidade (paginação opcional)
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

---

## Integração WebSocket (Frontend React)
Resumo do fluxo:
1. Frontend autentica via `POST /auth/login` e obtém JWT.
2. Conecta a `/ws` (SockJS) com header `Authorization: Bearer <token>` no frame CONNECT.
3. Assina os tópicos relevantes e atualiza a UI conforme os payloads recebidos.

Detalhes e exemplos de cliente STOMP, hooks e payloads continuam iguais à seção anterior do projeto.

---

## Frontend: Implementando “Esqueci minha senha”
A seguir um guia direto para implementar as telas e chamadas no frontend (ex.: React). Pressupõe que `VITE_API_BASE_URL` (ou similar) aponte para o backend e que a rota `/reset-password` exista no app.

1) Tela “Esqueci minha senha” (formulário de e-mail)
- Caminho sugerido: `/forgot-password`.
- Campos: `email` (obrigatório, formato válido).
- Ação:
  - `POST /auth/forgot-password` com `{ email }`.
  - Sempre exibir mensagem neutra: “Se este e-mail estiver cadastrado, enviaremos instruções...” (evita revelar se o e-mail existe).

Exemplo (fetch):
```js
async function solicitarReset(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  // Tratar resposta 200 sempre com a mesma mensagem para o usuário
}
```

2) Tela “Redefinir senha” (consome token)
- Caminho: `/reset-password`.
- Lê `token` de `?token=<TOKEN>` (querystring) do link enviado por e-mail.
- Antes de exibir o formulário, valide o token:
  - `GET /auth/reset-password/validate?token=...`.
  - Se 200 e `data=true`: renderizar formulário.
  - Se 400 ou `data=false`: exibir mensagem “Token inválido ou expirado” e um botão para solicitar novo e-mail.

Exemplo (validação):
```js
async function validarToken(token) {
  const res = await fetch(`${API_BASE}/auth/reset-password/validate?token=${encodeURIComponent(token)}`);
  const body = await res.json();
  return res.ok && body?.data === true;
}
```

3) Enviar nova senha
- Regras sugeridas de front: tamanho mínimo (8+), letras maiúsculas/minúsculas, dígitos e caractere especial.
- `POST /auth/reset-password` com `{ token, novaSenha }`.
- Sucesso: informar “Senha redefinida com sucesso!” e oferecer atalho para a tela de login.

Exemplo (envio):
```js
async function redefinirSenha(token, novaSenha) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, novaSenha })
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.message || 'Erro ao redefinir senha');
}
```

4) Experiência do usuário e UTMs
- O link no e-mail inclui UTMs padrão para analytics: `utm_source=qmanager-backend&utm_medium=reset-email&utm_campaign=password_reset`.
- Preserve o `?token=...` ao navegar/compartilhar a tela.

5) Erros comuns e dicas
- Token expirado → mostre CTA para reenviar e-mail (“Esqueci minha senha”).
- Não exponha ao usuário se o e-mail existe ou não.
- Trate indisponibilidade de rede com feedback amigável e opção de tentar novamente.

---

## Guia Rápido para o Frontend
- Autenticação: `POST /auth/login` retorna JWT (use no header `Authorization: Bearer` para APIs e no CONNECT do WebSocket)
- Confirmação de e-mail: link do backend direciona para o login do frontend
- Esqueci minha senha: telas `/forgot-password` e `/reset-password?token=...` conforme guia acima
- WebSocket: conecte-se a `/ws` com JWT e assine os tópicos necessários

---

## Estrutura de Dados Principais
- Usuário, Unidade de Atendimento, Setor, Fila, Painel, EntradaFila
- Tokens de segurança: `ConfirmationToken` (cadastro) e `PasswordResetToken` (redefinição de senha)

---

## Comandos Úteis
- Subir aplicação:
  ```bash
  ./mvnw spring-boot:run
  ```
- Rodar testes e cobertura:
  ```bash
  ./mvnw clean test jacoco:report
  ```
- Gerar JAR:
  ```bash
  ./mvnw clean package
  ```

Observação: o profile ativo padrão é `dev` (`spring.profiles.active=dev`), porta `8899`.

---

## Contribuições e Licença
Contribuições são bem-vindas via PRs. Verifique padrões de código, testes e documentação antes de submeter.

Este projeto é disponibilizado sob licença compatível definida pelo repositório (ver arquivo de licença, se aplicável).
