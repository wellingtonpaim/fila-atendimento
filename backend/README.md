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
  - [Confirmação de E-mail (Página HTML + UTMs)](#confirmação-de-e-mail-página-html--utms)
  - [Propriedades relacionadas ao Auth](#propriedades-relacionadas-ao-auth)
- [Paginação da API](#paginação-da-api)
- [Recursos da API por Módulo](#recursos-da-api-por-módulo)
  - [Autenticação (/auth)](#autenticação-auth)
  - [Unidades de Atendimento (/api/unidades-atendimento)](#unidades-de-atendimento-apiunidades-atendimento)
  - [Setores (/api/setores)](#setores-apisetores)
  - [Filas (/api/filas)](#filas-apifilas)
  - [Entrada na Fila (/api/entrada-fila)](#entrada-na-fila-apientrada-fila)
  - [Painéis (/painel)](#painéis-painel)
  - [Clientes (/api/clientes)](#clientes-apiclientes)
  - [Usuários (/api/usuarios)](#usuários-apiusuarios)
  - [Dashboard (/api/dashboard)](#dashboard-apidashboard)
  - [E-mail (/api/email)](#e-mail-apiemail)
  - [WebSocket](#websocket)
- [Integração WebSocket (Frontend React)](#integração-websocket-frontend-react)
- [Guia Rápido para o Frontend](#guia-rápido-para-o-frontend)
- [Referência: Telas do Frontend](#referência-telas-do-frontend)
- [Estrutura de Dados Principais](#estrutura-de-dados-principais)
- [Comandos Úteis](#comandos-úteis)
- [Contribuições e Licença](#contribuições-e-licença)

---

## Visão Geral
O Q-Manager é uma plataforma web para gerenciamento inteligente de filas e atendimento, com foco inicial em unidades de saúde e arquitetura flexível para outros domínios. Fornece APIs REST seguras, comunicação em tempo real para painéis, e mecanismos de autenticação, autorização e confirmação de conta por e-mail.

## Arquitetura e Tecnologias
- Backend: Java 21, Spring Boot 3
- Segurança: Spring Security + JWT
- Persistência: Spring Data JPA (Hibernate) + PostgreSQL
- Migrações: Flyway
- Tempo real: Spring WebSocket (STOMP)
- Documentação: SpringDoc OpenAPI (Swagger UI)
- Qualidade: JUnit 5 + JaCoCo

---

## Requisitos, Configuração e Execução
### Variáveis e Propriedades de Ambiente
Banco/E-mail (exemplos):
- `DB_HOST` • `DB_USER` • `DB_PASSWORD`
- `spring.mail.username` • `spring.mail.password`

Integração Frontend e Links:
- `app.base-url` (default dev: `http://localhost:8899`) – Base pública do backend (usada para montar links enviados por e-mail).
- `app.qmanager.login-url` – URL de login do frontend.
  - dev (default): `http://localhost:3000/login`
  - prod (exemplo): `https://app.qmanager.example.com/login`
- `app.qmanager.error-url` – URL de erro/retentativa no frontend.
  - dev (default): `http://localhost:3000/login?retry=true`
  - prod (exemplo): `https://app.qmanager.example.com/login?retry=true`

Perfis:
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
Códigos de status:
- 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error

---

## Autenticação e Segurança
- JWT stateless
- Controle de acesso por unidade de atendimento
- Perfis: ADMINISTRADOR, USUARIO
- Confirmação de e-mail obrigatória para ativação de contas

### Confirmação de E-mail (Página HTML + UTMs)
- Endpoint de confirmação: `GET /auth/confirmar?token=...`
- Retorna uma página HTML (Thymeleaf) amigável, com mensagem de sucesso/erro e um botão de ação:
  - Sucesso: “Ir para Q-Manager” (redireciona ao login do frontend)
  - Erro: “Tentar novamente” (redireciona para URL de retentativa)
- O link do botão inclui UTMs para analytics do frontend:
  - `utm_source=qmanager-backend`
  - `utm_medium=confirm-email-page`
  - `utm_campaign=signup_confirmation`
  - `utm_content=success|error`
- Templates:
  - Página: `templates/auth/confirmacao-resultado.html`
  - E-mail: `templates/email/confirmacao-cadastro.html`

### Propriedades relacionadas ao Auth
- `app.base-url`: base do backend para montar o link do e-mail (ex.: `https://api.seudominio.com`)
- `app.qmanager.login-url`: URL de login do frontend (sucesso)
- `app.qmanager.error-url`: URL de retentativa/erro do frontend (erro)

---

## Paginação da API
A paginação é opcional e padronizada via `page` (base 0) e `size`.
- Se `page`/`size` não forem enviados: retorna a lista completa (comportamento atual) e sem headers de paginação.
- Se enviados: retorna o slice da página e inclui headers com metadados.

Headers de paginação retornados:
- `X-Total-Count`: total de registros
- `X-Total-Pages`: total de páginas (com base em `size`)
- `X-Page`: página atual (base 0)
- `X-Page-Size`: tamanho da página
- `Content-Range`: `items start-end/total` (end inclusivo)

Endpoints com paginação:
- `GET /api/usuarios`
- `GET /api/clientes`
- `GET /api/clientes/nome/{nome}`
- `GET /api/setores`
- `GET /api/setores/nome/{nome}`
- `GET /api/unidades-atendimento`
- `GET /api/unidades-atendimento/nome/{nome}`
- `GET /api/unidades-atendimento/public/login`
- `GET /painel?unidadeAtendimentoId={id}`
- `GET /painel/unidade/{unidadeId}`
- `GET /api/filas`              
- `GET /api/filas/unidade/{unidadeId}`
- `GET /api/entrada-fila/aguardando/{filaId}`

Exemplos:
```bash
# Primeira página com 10 itens (usuários)
curl -i "http://localhost:8899/api/usuarios?page=0&size=10"

# Busca por nome (clientes), página 1 tamanho 25
curl -i "http://localhost:8899/api/clientes/nome/Ana?page=1&size=25"
```

---

## Recursos da API por Módulo

### Autenticação (/auth)
- `POST /auth/login` – Autenticação com validação de acesso por unidade
- `POST /auth/register` – Registro público com envio de e-mail de confirmação
- `GET /auth/confirmar` – Página HTML de confirmação (ver seção Auth)
- `DELETE /auth/delete/{email}` – Desativar usuário por e-mail

### Unidades de Atendimento (/api/unidades-atendimento)
- `GET /api/unidades-atendimento` – Listar todas (paginaçāo opcional)
- `GET /api/unidades-atendimento/{id}` – Buscar por ID
- `GET /api/unidades-atendimento/nome/{nome}` – Buscar por nome (paginação opcional)
- `POST /api/unidades-atendimento` – Criar
- `PUT /api/unidades-atendimento/{id}` – Substituir
- `PATCH /api/unidades-atendimento/{id}` – Atualização parcial
- `DELETE /api/unidades-atendimento/{id}` – Desativar
- `GET /api/unidades-atendimento/public/login` – Listar (público) para tela de login (paginação opcional)

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
- `POST /api/entrada-fila/chamar-proximo` – Chamar próximo (params: `filaId`, `usuarioId`, `guiche`)
- `POST /api/entrada-fila/finalizar/{entradaFilaId}` – Finalizar atendimento
- `POST /api/entrada-fila/cancelar/{entradaFilaId}` – Cancelar atendimento
- `POST /api/entrada-fila/encaminhar/{entradaFilaIdOrigem}` – Encaminhar para outra fila
- `GET /api/entrada-fila/aguardando/{filaId}` – Listar aguardando (paginação opcional)

### Painéis (/painel)
- `GET /painel?unidadeAtendimentoId={id}` – Listar (paginação opcional)
- `GET /painel/{id}` – Buscar por ID (params: `unidadeAtendimentoId`)
- `GET /painel/unidade/{unidadeId}` – Listar por unidade (paginação opcional)
- `POST /painel` – Criar
- `PUT /painel/{id}` – Atualizar
- `DELETE /painel/{id}` – Desativar

### Clientes (/api/clientes)

#### Listar todos os clientes
`GET /api/clientes`
- Retorna todos os clientes cadastrados.
- Suporta paginação opcional via query params: `?page=0&size=20`

#### Buscar clientes por e-mail (busca parcial)
`GET /api/clientes/email/{email}`
- Retorna uma lista de clientes cujo e-mail contenha o valor informado (busca parcial, case-insensitive).
- Parâmetros opcionais de paginação: `?page=0&size=20`
- Exemplo: `/api/clientes/email/jose?size=10&page=0` retorna todos os clientes com "jose" no e-mail.

#### Buscar clientes por telefone (busca parcial)
`GET /api/clientes/telefone/{telefone}`
- Retorna uma lista de clientes cujo telefone contenha o valor informado (busca parcial).
- Parâmetros opcionais de paginação: `?page=0&size=20`
- Exemplo: `/api/clientes/telefone/98836?size=10&page=0` retorna todos os clientes com "98836" no telefone.

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

### E-mail (/api/email)
- `POST /api/email/send` – Envio de e-mail (serviço)

### WebSocket
Tópicos STOMP:
- `/topic/painel/{filaId}` – Atualizações para painéis públicos
- `/topic/fila/{setorId}` – Atualizações para profissionais

---

## Integração WebSocket (Frontend React)
Esta seção orienta o desenvolvedor React a consumir o canal em tempo real de chamadas de pacientes e atualização de filas.

### Visão Geral do Fluxo
1. Frontend autentica usuário via `POST /auth/login` e obtém um JWT.
2. Estabelece conexão STOMP sobre WebSocket (ou SockJS fallback) no endpoint `/ws`.
3. Envia no frame CONNECT o header `Authorization: Bearer <token>` (obrigatório).
4. Assina os tópicos relevantes:
   - Painel público da fila: `/topic/painel/{filaId}`
   - Painel do profissional (fila do setor): `/topic/fila/{setorId}`
5. Recebe payloads JSON (DTOs) e atualiza a UI. Quando houver nova chamada, `sinalizacaoSonora=true` e `mensagemVocalizacao` conterá texto para leitura.

### Endpoints e Prefixos
- Handshake WebSocket: `/ws` (aberto, handshake não exige token)
- Prefixo de envio de mensagens do cliente: `/app` (no momento não há endpoints de envio do cliente; apenas broadcast do servidor)
- Broker interno (simple broker) publica em: `/topic/**`

### Segurança
- A validação do token acontece no `CONNECT` via `WebSocketAuthInterceptor`.
- Se o token for inválido ou ausente: conexão é rejeitada (`Invalid JWT token` ou `Missing or invalid Authorization header`).
- O handshake HTTP é público, mas qualquer frame após CONNECT sem autenticação válida não prossegue.

### Bibliotecas Recomendadas (React)
Instale:
```bash
npm install @stomp/stompjs sockjs-client
```

### Exemplo de Cliente STOMP (Painel Público)
```javascript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8899';

export function createStompClient({ token, filaId, setorId, onPainel, onFila, onError }) {
  const client = new Client({
    // Fallback SockJS (recomendado se houver proxies / CORS complexos)
    webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
    // Se quiser tentar WebSocket nativo direto (sem SockJS), use: brokerURL: `${API_BASE.replace('http','ws')}/ws`
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000, // ms (backoff simples)
    debug: (str) => console.debug('[STOMP]', str),
    onConnect: () => {
      if (filaId) {
        client.subscribe(`/topic/painel/${filaId}`, (msg) => {
          try { onPainel && onPainel(JSON.parse(msg.body)); } catch (e) { console.error(e); }
        });
      }
      if (setorId) {
        client.subscribe(`/topic/fila/${setorId}`, (msg) => {
          try { onFila && onFila(JSON.parse(msg.body)); } catch (e) { console.error(e); }
        });
      }
    },
    onStompError: (frame) => {
      console.error('Broker error', frame.headers['message'], frame.body);
      onError && onError(frame.body);
    },
    onWebSocketError: (event) => {
      console.error('WS transport error', event);
      onError && onError(event);
    }
  });
  client.activate();
  return client;
}
```

### Estrutura dos Payloads
`/topic/painel/{filaId}` -> `PainelPublicoDTO`:
```json
{
  "filaId": "c3713a4c-0d46-4d9c-9e57-8a1f5d7f9b2e",
  "chamadaAtual": {
    "nomePaciente": "Maria Silva",
    "guicheOuSala": "Guichê 2",
    "dataHoraChamada": "2025-10-03T14:22:31.123"
  },
  "ultimasChamadas": [
    { "nomePaciente": "João Lima", "guicheOuSala": "Guichê 1", "dataHoraChamada": "2025-10-03T14:20:00" },
    { "nomePaciente": "Ana Souza", "guicheOuSala": "Guichê 3", "dataHoraChamada": "2025-10-03T14:18:10" }
  ],
  "mensagemVocalizacao": "Maria Silva, compareça a Guichê 2!",
  "tempoExibicao": 15,
  "repeticoes": 3,
  "intervaloRepeticao": 5,
  "sinalizacaoSonora": true
}
```
Observações:
- `chamadaAtual` pode ser `null` se nenhuma chamada ativa.
- `ultimasChamadas` já inclui a atual nas posições iniciais? Não. A atual é fornecida separadamente.
- Controle de exibição e repetição no frontend baseado em `tempoExibicao`, `repeticoes`, `intervaloRepeticao`.
- Se `sinalizacaoSonora=true` e `mensagemVocalizacao` não vazia, realizar síntese de voz ou tocar áudio.

`/topic/fila/{setorId}` -> `PainelProfissionalDTO`:
```json
{
  "setorId": "9f8b5e2d-1ad3-4b22-9f0e-1b4a6c8a7d55",
  "filaAtual": [
    {
      "id": "...",
      "cliente": { "id": "...", "nome": "Carlos" },
      "prioridade": 1,
      "retorno": false,
      "status": "AGUARDANDO",
      "dataHoraEntrada": "2025-10-03T14:10:33.500"
      // ... outros campos de EntradaFilaResponseDTO
    }
  ]
}
```

### Exemplo de Hook React Simplificado
```javascript
import { useEffect, useRef, useState } from 'react';
import { createStompClient } from './stompClient';

export function usePainelRealtime({ token, filaId, setorId }) {
  const clientRef = useRef(null);
  const [painel, setPainel] = useState(null);
  const [fila, setFila] = useState(null);

  useEffect(() => {
    if (!token) return; // aguarda login
    clientRef.current = createStompClient({
      token,
      filaId,
      setorId,
      onPainel: (payload) => {
        setPainel(payload);
        if (payload?.sinalizacaoSonora && payload?.mensagemVocalizacao) {
          const utter = new SpeechSynthesisUtterance(payload.mensagemVocalizacao);
          utter.lang = 'pt-BR';
          speechSynthesis.speak(utter);
        }
      },
      onFila: setFila,
      onError: (e) => console.error('Erro STOMP', e)
    });
    return () => clientRef.current?.deactivate();
  }, [token, filaId, setorId]);

  return { painel, fila };
}
```

### Boas Práticas
- Atualize o token JWT antes de expirar: ao renovar, desconecte e reconecte com novo header.
- Trate `null` em `chamadaAtual` (mostrar placeholder ou estado "Aguardando chamada").
- Use `reconnectDelay` para resiliência; avalie backoff exponencial manual se necessário.
- Em TVs/Kiosks: desabilite suspensão de áudio e configure permissão de autoplay conforme navegador.
- Em produção, restrinja CORS e `setAllowedOriginPatterns` ao(s) domínio(s) do frontend.
- Para acessibilidade, também renderize o texto da chamada na tela além do áudio.

### Erros Comuns & Debug
| Sintoma | Causa Provável | Ação |
|--------|----------------|------|
| Conexão fecha logo após abrir | Token ausente/expirado | Renovar token e reconectar |
| 403 no handshake SockJS `info` | Falta de permissão `/ws/**` | Já ajustado na config; verifique reverse proxy |
| Sem áudio | `sinalizacaoSonora=false` ou bloqueio de autoplay | Habilitar interação do usuário ou liberar autoplay |
| Recebendo múltiplos handlers duplicados | Recriação de cliente sem cleanup | Certificar-se de chamar `deactivate()` no unmount |

### Teste Rápido Manual (sem React)
Abra o console do navegador:
```javascript
const sock = new SockJS('http://localhost:8899/ws');
const Stomp = window.Stomp.over(sock);
Stomp.connect({ Authorization: 'Bearer <TOKEN>' }, () => {
  Stomp.subscribe('/topic/painel/<FILA_ID>', m => console.log(JSON.parse(m.body)));
});
```

### Checklist de Integração
- [ ] Login funcionando e token armazenado (ex.: localStorage / contexto)
- [ ] Cliente STOMP inicializado após login
- [ ] Headers CONNECT enviando Authorization correto
- [ ] Assinatura dos tópicos relevantes criada
- [ ] Tratamento de reconexão implementado
- [ ] UI atualiza chamada atual + últimas chamadas
- [ ] Áudio / síntese de voz condicional
- [ ] Limpeza de recursos ao desmontar componente
- [ ] Monitorar logs de erro no console

---

## Guia Rápido para o Frontend
- Login exige seleção de unidade válida para o usuário.
- Registro envia e-mail de confirmação com link para `/auth/confirmar?token=...`.
- A página de confirmação mostra o resultado e redireciona com UTMs (sucesso/erro) para URLs configuráveis.
- Em listagens, prefira usar paginação (`page`/`size`) e leia os headers (`X-Total-Count`, `X-Total-Pages`, `Content-Range`, etc.).

---

## Referência: Telas do Frontend
(Compilado para orientar o consumo da API e fluxos de UI)

- Autenticação: Login, Registro, Confirmação de E-mail
- Área Administrativa: Dashboard, Gestão de Unidades, Setores, Filas
- Gestão de Pessoas: Clientes/Pacientes, Usuários/Profissionais
- Operacional: Entrada na Fila (Recepção), Painel do Profissional, Encaminhamento
- Painéis Públicos de Chamadas (TV/Monitor)
- Relatórios e Analytics: Métricas em tempo real, Relatórios analíticos, Produtividade
- Configurações e Administração: Painéis, Configurações gerais, Monitoramento do sistema
- Diretrizes de UX/UI: design system, acessibilidade, performance, feedback visual, temas

Cada uma dessas telas se alinha aos endpoints listados por módulo, aproveitando paginação, filtros e segurança JWT.

---

## Estrutura de Dados Principais
Entidades core: `UnidadeAtendimento`, `Setor`, `Fila`, `Cliente`, `Usuario`, `EntradaFila`, `Painel`.
Relações (resumo):
- UnidadeAtendimento 1..* Setor
- Setor 1..* Fila
- Fila 1..* EntradaFila
- Cliente 1..* EntradaFila
- Usuario *..* UnidadeAtendimento

---

## Comandos Úteis
```bash
# Executar todos os testes
./mvnw test

# Relatório de cobertura
./mvnw jacoco:report

# Executar com profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Build para produção
./mvnw clean package -Pprod
```

---

## Contribuições e Licença
Contribuições são bem-vindas. Abra uma issue/PR com testes passando.

Licença: MIT (ver arquivo LICENSE)

---

**Q-Manager** — Transformando a gestão de filas com tecnologia e inteligência. 🚀

---

## Paginação da API (Importante para o Frontend)

A partir desta versão, as listagens passam a suportar paginação opcional via query params, sem quebrar compatibilidade:

- Se page e size NÃO forem informados: o comportamento permanece o mesmo (retorna a lista completa, sem headers de paginação).
- Se page e size forem informados: a resposta é paginada e são adicionados headers com metadados.

Parâmetros
- page: número da página (base 0). Ex.: page=0 é a primeira página.
- size: tamanho da página (número de itens por página). Se size<=0, o backend normaliza para um valor padrão.

Headers de paginação retornados
- X-Total-Count: total de registros na coleção (antes da paginação)
- X-Total-Pages: total de páginas (baseado em size)
- X-Page: página atual (base 0)
- X-Page-Size: tamanho da página efetivo
- Content-Range: items start-end/total (end é inclusivo)

Endpoints com paginação
- GET /api/usuarios
- GET /api/clientes
- GET /api/clientes/nome/{nome}
- GET /api/setores
- GET /api/setores/nome/{nome}
- GET /api/unidades-atendimento
- GET /api/unidades-atendimento/nome/{nome}
- GET /api/unidades-atendimento/public/login
- GET /painel?unidadeAtendimentoId={id}
- GET /painel/unidade/{unidadeId}
- GET /api/filas
- GET /api/filas/unidade/{unidadeId}
- GET /api/entrada-fila/aguardando/{filaId}

Exemplos de consumo
1) Primeira página com 10 itens (usuários)
```bash
curl -s -i "http://localhost:8899/api/usuarios?page=0&size=10"
```
Headers esperados (exemplo):
```
X-Total-Count: 128
X-Total-Pages: 13
X-Page: 0
X-Page-Size: 10
Content-Range: items 0-9/128
```
Body (inalterado, mesmo formato de antes):
```json
{
  "success": true,
  "message": "Usuários listados com sucesso",
  "data": [ /* array de usuários (até 10) */ ]
}
```

2) Busca por nome com paginação (clientes)
```bash
curl -s -i "http://localhost:8899/api/clientes/nome/Ana?page=1&size=25"
```

Boas práticas para o frontend
- Em telas de listagem, prefira enviar page e size para evitar transferências grandes e melhorar a UX.
- Use X-Total-Count e X-Total-Pages para montar a paginação (número total de páginas, exibição de paginação etc.).
- Content-Range é útil para depurar intervalos de itens retornados (o índice final é inclusivo).
- Se for necessário carregar tudo de uma vez (ex.: dropdowns pequenos), basta omitir page e size.

Compatibilidade
- Não houve alteração no corpo das respostas. A paginação é 100% opt-in. Aplicações existentes continuam funcionando sem qualquer mudança.
