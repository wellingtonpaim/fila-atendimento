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
    A aplicação utiliza variáveis de ambiente para a configuração do banco de dados e do serviço de e-mail. Crie um arquivo `application-dev.properties` ou configure as variáveis no seu sistema. As principais são:
    * `DB_HOST`: URL de conexão JDBC para o PostgreSQL (ex: `jdbc:postgresql://localhost:5432/qmanager_db`).
    * `DB_USER`: Usuário do banco de dados.
    * `DB_PASSWORD`: Senha do banco de dados.
    * `USERNAME-MAIL`: Usuário do seu serviço de e-mail (ex: Gmail).
    * `PASSWORD-MAIL`: Senha do seu serviço de e-mail.

3.  **Execute a aplicação:**
    Utilize o Maven Wrapper para compilar e iniciar a aplicação:
    ```bash
    ./mvnw spring-boot:run
    ```
    A API estará disponível em `http://localhost:8899`.

4.  **Execute os testes e relatórios de cobertura:**
    ```bash
    ./mvnw clean test jacoco:report
    ```
    O relatório de cobertura estará disponível em `target/site/jacoco/index.html`.

## 5. Documentação da API (Swagger)

Com a aplicação em execução, a documentação completa e interativa da API pode ser acessada através do Swagger UI.

* **URL da Documentação:** [**http://localhost:8899/swagger-ui/index.html**](http://localhost:8899/swagger-ui/index.html)

Nesta interface, é possível visualizar todos os endpoints, seus DTOs (Data Transfer Objects), parâmetros necessários e testar as requisições diretamente pelo navegador.

## 6. Principais Módulos e Endpoints

### 🔐 **Módulo de Autenticação (`/auth`)**
Responsável pela segurança e controle de acesso ao sistema.

**Endpoints principais:**
- `POST /auth/login` - Autenticação de usuários com validação de acesso por unidade
- `POST /auth/register` - Registro de novos usuários com confirmação por e-mail
- `GET /auth/confirmar` - Confirmação de e-mail para ativação de conta
- `DELETE /auth/delete/{email}` - Exclusão de usuários por e-mail

### 🏥 **Módulo de Unidades de Atendimento (`/api/unidades-atendimento`)**
Gerencia as unidades físicas onde o atendimento acontece (hospitais, clínicas, etc.).

**Endpoints principais:**
- `GET /api/unidades-atendimento` - Listar todas as unidades
- `GET /api/unidades-atendimento/{id}` - Buscar unidade específica
- `GET /api/unidades-atendimento/nome/{nome}` - Buscar por nome
- `POST /api/unidades-atendimento` - Criar nova unidade
- `PUT /api/unidades-atendimento/{id}` - Atualizar unidade completa
- `PATCH /api/unidades-atendimento/{id}` - Atualização parcial
- `DELETE /api/unidades-atendimento/{id}` - Desativar unidade

### 🏢 **Módulo de Setores (`/api/setores`)**
Controla os setores dentro de cada unidade (Recepção, Triagem, Consultórios, etc.).

**Endpoints principais:**
- `GET /api/setores` - Listar todos os setores
- `GET /api/setores/{id}` - Buscar setor específico
- `GET /api/setores/nome/{nome}` - Buscar setores por nome
- `POST /api/setores` - Criar novo setor
- `PUT /api/setores/{id}` - Atualizar setor completo
- `PATCH /api/setores/{id}` - Atualização parcial
- `DELETE /api/setores/{id}` - Desativar setor

### 📋 **Módulo de Filas (`/api/filas`)**
Gerencia as filas de atendimento vinculadas aos setores.

**Endpoints principais:**
- `GET /api/filas/unidade/{unidadeId}` - Listar filas por unidade
- `GET /api/filas/{id}` - Buscar fila específica
- `POST /api/filas` - Criar nova fila
- `PATCH /api/filas/{id}` - Atualizar fila
- `DELETE /api/filas/{id}` - Desativar fila

### 👥 **Módulo de Clientes (`/api/clientes`)**
Cadastro e gestão dos clientes/pacientes do sistema.

**Endpoints principais:**
- `GET /api/clientes` - Listar todos os clientes
- `GET /api/clientes/{id}` - Buscar cliente por ID
- `GET /api/clientes/cpf/{cpf}` - Buscar cliente por CPF
- `GET /api/clientes/nome/{nome}` - Buscar clientes por nome
- `POST /api/clientes` - Cadastrar novo cliente
- `PUT /api/clientes/{id}` - Atualizar cliente completo
- `PATCH /api/clientes/{id}` - Atualização parcial
- `DELETE /api/clientes/{id}` - Desativar cliente

### 👨‍⚕️ **Módulo de Usuários (`/api/usuarios`)**
Gestão dos profissionais e administradores do sistema.

**Endpoints principais:**
- `GET /api/usuarios` - Listar todos os usuários
- `GET /api/usuarios/{id}` - Buscar usuário por ID
- `GET /api/usuarios/email/{email}` - Buscar usuário por e-mail
- `POST /api/usuarios` - Criar novo usuário
- `PUT /api/usuarios/{id}` - Atualizar usuário completo
- `PATCH /api/usuarios/{id}` - Atualização parcial
- `DELETE /api/usuarios/{id}` - Desativar usuário

### 🎯 **Módulo de Entrada em Fila (`/api/entrada-fila`) - CORAÇÃO DO SISTEMA**
Este é o módulo mais importante, responsável por todo o fluxo de atendimento.

**Endpoints principais:**
- `POST /api/entrada-fila` - Adicionar cliente à fila
- `POST /api/entrada-fila/chamar-proximo` - Chamar próximo cliente
- `POST /api/entrada-fila/finalizar/{entradaFilaId}` - Finalizar atendimento
- `POST /api/entrada-fila/cancelar/{entradaFilaId}` - Cancelar atendimento
- `POST /api/entrada-fila/encaminhar/{entradaFilaIdOrigem}` - Encaminhar para outra fila
- `GET /api/entrada-fila/aguardando/{filaId}` - Listar clientes aguardando

### 📺 **Módulo de Painéis (`/painel`)**
Gerencia os painéis de exibição pública para chamadas.

**Endpoints principais:**
- `GET /painel` - Listar painéis por unidade
- `GET /painel/{id}` - Buscar painel específico
- `GET /painel/unidade/{unidadeId}` - Listar painéis por unidade
- `POST /painel` - Criar novo painel
- `PUT /painel/{id}` - Atualizar painel
- `DELETE /painel/{id}` - Desativar painel

### 📊 **Módulo de Dashboard (`/api/dashboard`)**
Fornece métricas e análises para gestão estratégica.

**Endpoints principais:**
- `GET /api/dashboard/tempo-medio-espera` - Calcular tempo médio de espera
- `GET /api/dashboard/produtividade` - Analisar produtividade por profissional
- `GET /api/dashboard/horarios-pico` - Identificar horários de maior movimento
- `GET /api/dashboard/fluxo-pacientes` - Analisar fluxo de pacientes

### 📧 **Módulo de E-mail (`/api/email`)**
Serviço para envio de notificações e comunicações.

**Endpoints principais:**
- `POST /api/email/send` - Enviar e-mail

### 🔌 **WebSocket para Tempo Real**
Comunicação em tempo real para atualizações automáticas dos painéis.

**Tópicos WebSocket:**
- `/topic/painel/{filaId}` - Atualizações para painéis públicos
- `/topic/fila/{setorId}` - Atualizações para painéis de profissionais

---

## 7. Guia de Telas para Desenvolvimento Frontend

Esta seção detalha todas as telas que devem ser implementadas no frontend para atender completamente às funcionalidades da API.

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
