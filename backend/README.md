# Q-Manager - Sistema de Gestão de Filas Inteligentes

[![Java](https://img.shields.io/badge/Java-21-blue.svg)](https://www.java.com)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/API%20Docs-Swagger-orange.svg)](/swagger-ui/index.html)
[![JWT](https://img.shields.io/badge/Security-JWT-black.svg)](https://jwt.io/)

---

## 1. Visão Geral

O **Q-Manager** é uma plataforma web moderna e robusta, projetada para gerenciar e otimizar o fluxo de atendimento de clientes em múltiplos ambientes. O sistema nasce como uma solução genérica e adaptável, com sua implementação inicial focada no complexo fluxo de unidades de saúde, mas arquitetado para ser facilmente configurável para outros cenários de negócio.

O principal objetivo do projeto é substituir sistemas de controle de filas manuais ou legados por uma solução centralizada, eficiente e orientada a dados.

## 2. Objetivos Principais

* **⚡ Otimizar o Fluxo de Atendimento:** Reduzir tempos de espera e gargalos, direcionando os clientes de forma inteligente entre os setores.
* **😊 Melhorar a Experiência do Cliente:** Oferecer um sistema de chamada transparente e moderno, com painéis visuais e comunicação em tempo real.
* **📊 Empoderar Gestores com Dados:** Fornecer um dashboard analítico com métricas e KPIs para permitir uma tomada de decisão estratégica e baseada em dados.
* **🔧 Flexibilidade e Escalabilidade:** Criar uma base de código expansível e adaptável para diferentes regras de negócio com o mínimo de retrabalho.

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

## 4. Como Executar o Projeto

### Pré-requisitos
* Java JDK 21 ou superior.
* Maven 3.x.
* Uma instância do PostgreSQL em execução.

### Passos para Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/wellingtonpaim/fila-atendimento.git](https://github.com/wellingtonpaim/fila-atendimento.git)
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

## 5. Documentação da API (Swagger)

Com a aplicação em execução, a documentação completa e interativa da API pode ser acessada através do Swagger UI.

* **URL da Documentação:** [**http://localhost:8899/swagger-ui/index.html**](http://localhost:8899/swagger-ui/index.html)

Nesta interface, é possível visualizar todos os endpoints, seus DTOs (Data Transfer Objects), parâmetros necessários e testar as requisições diretamente pelo navegador.

## 6. Principais Módulos e Endpoints

A API é dividida nos seguintes módulos principais:

* **`/auth`**: Endpoints para autenticação (`/login`), registro de usuários (`/register`) e confirmação de e-mail.
* **`/api/unidades-atendimento`**: CRUD completo para gerenciar as unidades de atendimento (hospitais, clínicas, etc.).
* **`/api/setores`**: CRUD para os setores dentro de uma unidade (Recepção, Triagem, Consultório, etc.).
* **`/api/filas`**: CRUD para as filas, que são vinculadas a um setor e a uma unidade.
* **`/api/clientes`**: CRUD para o cadastro e consulta de clientes/pacientes.
* **`/api/usuarios`**: CRUD para gerenciar os usuários do sistema (profissionais de saúde, administradores).
* **`/api/entrada-fila`**: O coração do sistema. Controla a adição de um cliente a uma fila, a chamada para atendimento, finalização e encaminhamento.
* **`/painel`**: Gerenciamento dos painéis de exibição pública.
* **`/api/dashboard`**: Endpoints para extrair métricas e KPIs, como tempo médio de espera, produtividade e horários de pico. 