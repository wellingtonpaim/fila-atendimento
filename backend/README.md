# Q-Manager - Sistema de Gestão de Filas Inteligentes

[![Java](https://img.shields.io/badge/Java-21-blue.svg)](https://www.java.com)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/API%20Docs-Swagger-orange.svg)](/swagger-ui/index.html)
[![JWT](https://img.shields.io/badge/Security-JWT-black.svg)](https://jwt.io/)
[![WebSocket](https://img.shields.io/badge/Real%20Time-WebSocket-yellow.svg)](https://spring.io/guides/gs/messaging-stomp-websocket/)

---

## 1. Visão Geral

O **Q-Manager** é uma plataforma web moderna e robusta, projetada para gerenciar e otimizar o fluxo de atendimento de clientes em múltiplos ambientes. O sistema nasce como uma solução genérica e adaptável, com sua implementação inicial focada no complexo fluxo de unidades de saúde, mas arquitetado para ser facilmente configurável para outros cenários de negócio.

O principal objetivo do projeto é substituir sistemas de controle de filas manuais ou legados por uma solução centralizada, eficiente e orientada a dados, proporcionando uma experiência moderna tanto para gestores quanto para clientes e profissionais.

## 2. Objetivos Principais

* **⚡ Otimizar o Fluxo de Atendimento:** Reduzir tempos de espera e gargalos, direcionando os clientes de forma inteligente entre os setores.
* **😊 Melhorar a Experiência do Cliente:** Oferecer um sistema de chamada transparente e moderno, com painéis visuais e comunicação em tempo real.
* **📊 Empoderar Gestores com Dados:** Fornecer um dashboard analítico com métricas e KPIs para permitir uma tomada de decisão estratégica e baseada em dados.
* **🔧 Flexibilidade e Escalabilidade:** Criar uma base de código expansível e adaptável para diferentes regras de negócio com o mínimo de retrabalho.
* **🔒 Segurança e Controle de Acesso:** Sistema robusto de autenticação e autorização baseado em perfis e unidades de atendimento.

## 3. Arquitetura e Tecnologias

O projeto é construído sobre uma base tecnológica moderna, robusta e escalável, seguindo as melhores práticas de desenvolvimento de software.

| Camada         | Tecnologia                                                                                                 | Propósito                                                                                              |
| :------------- | :--------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Backend** | **Java 21 & Spring Boot 3** | Plataforma de alta performance para a construção de APIs RESTful robustas.                           |
|                | **Spring Security & JWT**   | Controle de acesso granular e seguro baseado em papéis (`ADMINISTRADOR`, `USUARIO`) e tokens JWT.      |
|                | **Spring Data JPA & Hibernate** | Camada de persistência para abstração e comunicação com o banco de dados.                               |
|                | **Spring WebSocket**                                                    | Comunicação bidirecional para atualizações em tempo real (ex: painéis de chamada).                    |
| **Banco de Dados** | **PostgreSQL**          | Sistema de banco de dados relacional poderoso e confiável.                                           |
|                | **Flyway**                   | Ferramenta para versionamento e migração de schemas de banco de dados.                                 |
| **Documentação** | **SpringDoc OpenAPI (Swagger UI)** | Geração automática de documentação interativa para a API.                                             |
| **Qualidade** | **JaCoCo & JUnit 5** | Cobertura de código e testes unitários/integração para garantir qualidade e confiabilidade.                                             |

---

## Novidades (28/09/2025)

Estas alterações impactam diretamente como o frontend consome a API:

- Endpoint `GET /auth/confirmar` agora retorna uma PÁGINA HTML (Thymeleaf) estilizada e amigável, não mais JSON.
  - Mostra mensagem de sucesso/erro da confirmação do e-mail.
  - Exibe um único botão de ação que varia conforme o status:
    - Sucesso: texto "Ir para Q-Manager" e redireciona para a URL de login do frontend.
    - Erro: texto "Tentar novamente" e redireciona para a URL de retentativa/erro configurável.
  - O link do botão inclui UTMs para analytics do frontend: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` (success/error).
- Novas propriedades de configuração:
  - `app.qmanager.login-url`: URL de login do frontend (por ambiente).
  - `app.qmanager.error-url`: URL de erro/retentativa do frontend (por ambiente).
  - `app.base-url`: base pública do backend usada para montar o link do e-mail de confirmação.
- Templates Thymeleaf adicionados:
  - Página de confirmação: `templates/auth/confirmacao-resultado.html`.
  - E-mail de confirmação: `templates/email/confirmacao-cadastro.html`.

---

## 4. Como Executar o Projeto

### Pré-requisitos
* Java JDK 21 ou superior.
* Maven 3.x.
* Uma instância do PostgreSQL em execução.
* Configuração de um servidor SMTP para envio de e-mails (recomendado: Gmail).

### Passos para Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/wellingtonpaim/fila-atendimento.git
    cd fila-atendimento/backend
    ```

2.  **Configure as variáveis de ambiente:**
    A aplicação utiliza variáveis de ambiente para a configuração do banco de dados, e-mail e integração com o frontend. As principais são:

    Backend/DB/E-mail:
    - `DB_HOST` • `DB_USER` • `DB_PASSWORD`
    - `spring.mail.username` • `spring.mail.password` (ou equivalente via seu provedor)

    Integração Frontend e Links:
    - `QMANAGER_LOGIN_URL` (opcional) — URL de login no frontend; default em dev: `http://localhost:3000/login`.
    - `QMANAGER_ERROR_URL` (opcional) — URL de erro/retentativa no frontend; default em dev: `http://localhost:3000/login?retry=true`.
    - `app.base-url` (opcional) — base pública do backend para montar os links de confirmação enviados por e-mail; default: `http://localhost:8899`.

    Exemplos nos profiles:
    - `src/main/resources/application-dev.properties`
      ```properties
      app.qmanager.login-url=${QMANAGER_LOGIN_URL:http://localhost:3000/login}
      app.qmanager.error-url=${QMANAGER_ERROR_URL:http://localhost:3000/login?retry=true}
      app.base-url=http://localhost:8899
      ```
    - `src/main/resources/application-prod.properties`
      ```properties
      app.qmanager.login-url=${QMANAGER_LOGIN_URL:https://app.qmanager.example.com/login}
      app.qmanager.error-url=${QMANAGER_ERROR_URL:https://app.qmanager.example.com/login?retry=true}
      # app.base-url deve apontar para a URL pública do backend em produção
      # app.base-url=https://api.suaempresa.com
      ```

3.  **Execute a aplicação:**
    ```bash
    ./mvnw spring-boot:run
    ```
    A API estará disponível em `http://localhost:8899`.

4.  **Execute os testes e relatórios de cobertura:**
    ```bash
    ./mvnw clean test jacoco:report
    ```
    O relatório de cobertura estará disponível em `target/site/jacoco/index.html`.

---

## 5. Documentação da API (Swagger)

Com a aplicação em execução, a documentação completa e interativa da API pode ser acessada através do Swagger UI.

* **URL da Documentação:** [**http://localhost:8899/swagger-ui/index.html**](http://localhost:8899/swagger-ui/index.html)

Nesta interface, é possível visualizar todos os endpoints, seus DTOs (Data Transfer Objects), parâmetros necessários e testar as requisições diretamente pelo navegador.

---

## 6. Principais Módulos e Endpoints

### 🔐 **Módulo de Autenticação (`/auth`) — ATUALIZADO**

- `POST /auth/login` — Autenticação de usuários com validação de acesso por unidade.
- `POST /auth/register` — [PÚBLICO] Registro de novos usuários com confirmação por e-mail.
- `GET /auth/confirmar` — [PÚBLICO] Retorna uma página HTML do Q-Manager informando o resultado da confirmação do e-mail.
  - Quando o token é válido: exibe mensagem de sucesso e um botão "Ir para Q-Manager".
  - Quando inválido/expirado: exibe mensagem de erro e um botão "Tentar novamente".
  - O botão direciona para URLs configuráveis por ambiente e inclui UTMs para analytics:
    - `utm_source=qmanager-backend`
    - `utm_medium=confirm-email-page`
    - `utm_campaign=signup_confirmation`
    - `utm_content=success|error`
- `DELETE /auth/delete/{email}` — Exclusão (desativação) de usuários por e-mail.

Notas importantes:
- O endpoint `/auth/confirmar` não responde mais JSON; é uma view HTML (Thymeleaf) pensada para o navegador do usuário.
- O link do e-mail é montado a partir de `app.base-url` (ex.: `https://api.seudominio.com/auth/confirmar?token=...`).

### Templates relacionados
- Página HTML (confirmação): `src/main/resources/templates/auth/confirmacao-resultado.html`
- E-mail de confirmação: `src/main/resources/templates/email/confirmacao-cadastro.html`

---

## 7. Guia rápido para o Frontend

- Após o registro (POST `/auth/register`), o usuário recebe um e-mail com o link de confirmação.
- Ao clicar, o navegador abre `/auth/confirmar?token=...`, que renderiza a página HTML do backend.
- O botão exibido na página direciona para:
  - Sucesso: `app.qmanager.login-url` com UTMs.
  - Erro: `app.qmanager.error-url` com UTMs (por exemplo, uma página de login com instruções de nova tentativa).
- O frontend pode instrumentar analytics através dessas UTMs sem nenhuma configuração adicional.

---

## 8. Seções seguintes inalteradas

As demais descrições de módulos (Unidades, Setores, Filas, Clientes, Usuários, Painéis, Dashboard, E-mail, WebSocket, Telas do Frontend etc.) permanecem válidas. Consulte as seções abaixo para detalhes completos de cada módulo.

---

## 9. Telas do Frontend (referência)

### 🔐 **Módulo de Autenticação**

#### **1. Tela de Login**
- **Propósito:** Autenticação de usuários no sistema
- **Campos:** E-mail, Senha, Seleção de Unidade de Atendimento
- **Funcionalidades:** 
  - Validação de credenciais
  - Seleção da unidade onde o usuário irá trabalhar
  - Redirecionamento baseado no perfil (Admin/Usuário)
  - Links para registro e recuperação de senha

#### **2. Tela de Registro**
- **Propósito:** Cadastro de novos usuários
- **Campos:** Nome, E-mail, Senha, Confirmação de Senha, Categoria (Admin/Usuário)
- **Funcionalidades:**
  - Validação de formulário
  - Envio de e-mail de confirmação
  - Feedback de sucesso/erro

#### **3. Tela de Confirmação de E-mail**
- **Propósito:** Ativação de conta após registro
- **Funcionalidades:**
  - Validação do token de confirmação
  - Feedback de confirmação bem-sucedida
  - Redirecionamento para login

### 🏠 **Área Administrativa (Dashboard Principal)**

#### **4. Dashboard Administrativo**
- **Propósito:** Painel principal para administradores
- **Seções:**
  - Resumo geral da unidade (total de clientes, filas ativas, etc.)
  - Gráficos de desempenho em tempo real
  - Acesso rápido aos módulos principais
  - Notificações e alertas do sistema

#### **5. Tela de Gestão de Unidades de Atendimento**
- **Propósito:** CRUD completo de unidades
- **Componentes:**
  - Lista de unidades com busca e filtros
  - Modal/formulário para criar/editar unidades
  - Campos: Nome, Endereço completo, Telefone, E-mail, Status
  - Ações: Ativar/Desativar, Editar, Visualizar detalhes

#### **6. Tela de Gestão de Setores**
- **Propósito:** CRUD completo de setores por unidade
- **Componentes:**
  - Lista de setores filtrada por unidade
  - Modal/formulário para criar/editar setores
  - Campos: Nome, Descrição, Cor (para identificação visual), Unidade, Status
  - Vinculação com unidades de atendimento

#### **7. Tela de Gestão de Filas**
- **Propósito:** CRUD de filas vinculadas aos setores
- **Componentes:**
  - Lista de filas organizadas por setor/unidade
  - Formulário para criar/editar filas
  - Campos: Nome da fila, Setor, Prioridade, Tempo estimado de atendimento
  - Status da fila (ativa/inativa)

### 👥 **Gestão de Pessoas**

#### **8. Tela de Gestão de Clientes/Pacientes**
- **Propósito:** CRUD completo de clientes
- **Componentes:**
  - Lista paginada com busca avançada (nome, CPF, telefone)
  - Formulário detalhado de cadastro/edição
  - Campos: Dados pessoais, endereço completo, contatos
  - Histórico de atendimentos do cliente
  - Foto do cliente (opcional)

#### **9. Tela de Gestão de Usuários/Profissionais**
- **Propósito:** CRUD de usuários do sistema
- **Componentes:**
  - Lista de usuários com filtros por categoria e unidade
  - Formulário de cadastro/edição
  - Campos: Dados pessoais, credenciais, categoria, unidades de acesso
  - Controle de permissões e acessos

### 🎯 **Módulo Operacional (Fluxo de Atendimento)**

#### **10. Tela de Entrada na Fila (Recepção)**
- **Propósito:** Adicionar clientes às filas
- **Componentes:**
  - Busca rápida de clientes (CPF, nome, telefone)
  - Formulário rápido para novos clientes
  - Seleção da fila/setor de destino
  - Geração de senha/ticket
  - Impressão ou envio da senha por SMS/WhatsApp

#### **11. Painel do Profissional/Atendente**
- **Propósito:** Controle do atendimento pelo profissional
- **Componentes:**
  - Lista de clientes aguardando na fila do setor
  - Botão "Chamar Próximo" destacado
  - Informações do cliente atual (nome, motivo do atendimento)
  - Botões para: Finalizar Atendimento, Cancelar, Encaminhar para outro setor
  - Histórico de atendimentos do dia
  - Timer de atendimento

#### **12. Tela de Encaminhamento**
- **Propósito:** Transferir cliente para outro setor/fila
- **Componentes:**
  - Dados do cliente atual
  - Lista de setores/filas disponíveis para encaminhamento
  - Campo para observações do encaminhamento
  - Confirmação da transferência

### 📺 **Painéis de Exibição Pública**

#### **13. Painel Público de Chamadas**
- **Propósito:** Exibição pública das chamadas para os clientes
- **Características:**
  - **Layout em tela cheia** otimizado para TVs/monitores
  - **Atualização em tempo real** via WebSocket
  - Exibição das últimas chamadas (senha + guichê/local)
  - **Código de cores** por setor para fácil identificação
  - **Efeitos visuais e sonoros** para chamadas
  - **Informações adicionais:** horário, fila atual, tempo médio de espera
  - **Modo quiosque** (sem controles de navegação)

#### **14. Totem de Atendimento (Auto-atendimento)**
- **Propósito:** Permitir que clientes se cadastrem na fila automaticamente
- **Componentes:**
  - Interface touch-friendly com botões grandes
  - Busca de cliente existente (CPF/telefone)
  - Cadastro rápido de novos clientes
  - Seleção do serviço/setor desejado
  - Impressão de senha/ticket
  - Instruções claras e acessíveis

### 📊 **Módulo de Relatórios e Analytics**

#### **15. Dashboard de Métricas em Tempo Real**
- **Propósito:** Monitoramento operacional em tempo real
- **Componentes:**
  - **Métricas em tempo real:** clientes aguardando, tempo médio de espera por setor
  - **Gráficos dinâmicos:** fluxo por hora, produtividade por profissional
  - **Alertas:** filas congestionadas, tempos de espera elevados
  - **Comparativos:** performance atual vs. média histórica

#### **16. Tela de Relatórios Analíticos**
- **Propósito:** Análises detalhadas para gestão estratégica
- **Componentes:**
  - **Filtros avançados:** período, unidade, setor, profissional
  - **Relatórios disponíveis:**
    - Tempo médio de espera por período
    - Produtividade por profissional
    - Análise de horários de pico
    - Fluxo de pacientes entre setores
    - Taxa de cancelamentos/encaminhamentos
  - **Exportação:** PDF, Excel, CSV
  - **Agendamento:** relatórios periódicos automáticos

#### **17. Tela de Análise de Produtividade**
- **Propósito:** Avaliar performance individual e por equipe
- **Componentes:**
  - Rankings de produtividade
  - Gráficos de atendimentos por profissional
  - Tempo médio de atendimento por profissional
  - Comparativos e metas

### 🔧 **Configurações e Administração**

#### **18. Tela de Gestão de Painéis**
- **Propósito:** Configurar painéis de exibição pública
- **Componentes:**
  - Lista de painéis cadastrados
  - Configurações de layout (quantas chamadas mostrar, cores, etc.)
  - Vinculação de painéis com setores/filas
  - Preview em tempo real das configurações
  - Controle de dispositivos conectados

#### **19. Tela de Configurações Gerais**
- **Propósito:** Configurações globais do sistema
- **Componentes:**
  - Configurações de notificações (e-mail, SMS)
  - Parâmetros de tempo (tempo máximo de espera, alertas)
  - Configurações de aparência (logos, cores, temas)
  - Backup e restore de dados
  - Logs do sistema

#### **20. Tela de Monitoramento do Sistema**
- **Propósito:** Saúde e performance do sistema
- **Componentes:**
  - Status dos serviços (API, WebSocket, banco de dados)
  - Métricas de performance (CPU, memória, conexões)
  - Logs de erro em tempo real
  - Usuários conectados
  - Estatísticas de uso da API

### 📱 **Considerações para Responsividade**

Todas as telas devem ser **responsivas** e adaptáveis para:
- **Desktop:** Telas principais de administração e operação
- **Tablet:** Painéis de profissionais e totems de auto-atendimento
- **Mobile:** Consultas rápidas e notificações
- **TV/Monitor:** Painéis públicos de chamada

### 🎨 **Diretrizes de UX/UI**

1. **Design System Consistente:** Cores, tipografia e componentes padronizados
2. **Acessibilidade:** Conformidade com WCAG 2.1 para usuários com deficiência
3. **Performance:** Carregamento rápido e atualizações em tempo real fluidas
4. **Intuitividade:** Interface limpa com fluxos de trabalho claros
5. **Feedback Visual:** Estados de loading, confirmações e alertas claros
6. **Modo Escuro/Claro:** Opções de tema para diferentes ambientes

---

## 8. Estrutura de Dados Principais

### Entidades Core
- **UnidadeAtendimento:** Representa uma unidade física (hospital, clínica)
- **Setor:** Divisões dentro de uma unidade (recepção, consultório, etc.)
- **Fila:** Filas de atendimento vinculadas a setores
- **Cliente:** Pessoas que utilizam o serviço
- **Usuario:** Profissionais e administradores do sistema
- **EntradaFila:** Registro de entrada de um cliente em uma fila
- **Painel:** Configuração de painéis de exibição

### Relacionamentos Importantes
- Uma UnidadeAtendimento possui muitos Setores
- Um Setor possui muitas Filas
- Uma Fila possui muitas EntradaFila
- Um Cliente pode ter muitas EntradaFila
- Um Usuario pode estar vinculado a múltiplas UnidadeAtendimento

## 9. Padrões de Resposta da API

Todos os endpoints retornam respostas no formato `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Descrição da operação",
  "data": { /* objeto ou lista de dados */ }
}
```

### Códigos de Status HTTP
- **200 OK:** Operação bem-sucedida
- **400 Bad Request:** Dados inválidos ou erro de validação
- **401 Unauthorized:** Não autenticado
- **403 Forbidden:** Sem permissão para a operação
- **404 Not Found:** Recurso não encontrado
- **409 Conflict:** Conflito de dados (ex: e-mail duplicado)
- **500 Internal Server Error:** Erro interno do servidor

## 10. Segurança e Autenticação

### Sistema de Autenticação
- **JWT Tokens:** Para autenticação stateless
- **Controle por Unidade:** Usuários só acessam dados das unidades autorizadas
- **Perfis de Acesso:** ADMINISTRADOR e USUARIO
- **Confirmação por E-mail:** Ativação obrigatória de contas

### Autorização
- Administradores têm acesso completo a todas as funcionalidades
- Usuários comuns só podem operar dentro das unidades atribuídas
- Validação de acesso em nível de unidade para todos os endpoints

## 11. Desenvolvimento e Contribuição

### Estrutura do Projeto
```
src/
├── main/java/com/wjbc/fila_atendimento/
│   ├── controller/          # Controllers REST
│   ├── domain/
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── model/          # Entidades JPA
│   │   └── service/        # Lógica de negócio
│   ├── repository/         # Repositórios JPA
│   ├── security/          # Configurações de segurança
│   ├── configuration/     # Configurações Spring
│   └── exception/         # Tratamento de exceções
└── test/                  # Testes unitários e integração
```

### Comandos Úteis
```bash
# Executar todos os testes
./mvnw test

# Gerar relatório de cobertura
./mvnw jacoco:report

# Executar com profile específico
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Build para produção
./mvnw clean package -Pprod
```

---

## 12. Próximos Passos e Roadmap

### Funcionalidades Planejadas
- [ ] **Integração com WhatsApp** para notificações de chamada
- [ ] **Aplicativo móvel** para clientes acompanharem sua posição na fila
- [ ] **IA para previsão de tempos** de espera baseada em histórico
- [ ] **Integração com sistemas hospitalares** (HIS/EMR)
- [ ] **API pública** para integrações com sistemas terceiros
- [ ] **Multitenancy** para SaaS
- [ ] **Relatórios avançados** com machine learning

### Melhorias Técnicas
- [ ] **Cache distribuído** com Redis
- [ ] **Monitoramento** com Prometheus/Grafana
- [ ] **Deploy automatizado** com Docker/Kubernetes
- [ ] **CDN** para assets estáticos
- [ ] **Rate limiting** para proteção da API

---

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor, leia o guia de contribuição e certifique-se de que os testes passem antes de enviar um pull request.

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Q-Manager** - Transformando a gestão de filas com tecnologia e inteligência. 🚀
