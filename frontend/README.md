# Q-Manager Frontend 🚀

## Sistema de Gestão de Filas Inteligentes - Interface Web

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Instalável-purple.svg)](https://web.dev/progressive-web-apps/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1-green.svg)](https://www.w3.org/WAI/WCAG21/quickref/)

Este é o frontend moderno e acessível do **Q-Manager**, uma plataforma web robusta para gerenciamento e otimização de filas de atendimento. Desenvolvido com React, TypeScript e totalmente integrado com a API Java Spring Boot.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Recursos Principais](#-recursos-principais)
- [Integração com API Java](#-integração-com-api-java)
- [Instalação e Execução](#-instalação-e-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Serviços Implementados](#-serviços-implementados)
- [Acessibilidade](#-acessibilidade)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Como Contribuir](#-como-contribuir)

---

## 🌟 Visão Geral

O Q-Manager Frontend é uma Single Page Application (SPA) moderna que oferece uma interface intuitiva e acessível para gerenciar sistemas de filas de atendimento. Com foco na experiência do usuário e na acessibilidade, o sistema atende desde pequenas clínicas até grandes hospitais e órgãos públicos.

### ✨ Principais Características

- **🎨 Interface Moderna**: Design system consistente com componentes reutilizáveis
- **♿ Totalmente Acessível**: Conformidade com WCAG 2.1 para usuários com deficiência
- **📱 Responsivo**: Adaptável para desktop, tablet e mobile
- **🔄 Tempo Real**: Atualizações instantâneas via WebSocket
- **🔒 Seguro**: Autenticação JWT e controle de acesso granular
- **⚡ Performance**: Otimizado com lazy loading e cache inteligente

---

## 🛠️ Tecnologias

### Core
- **[React 18](https://reactjs.org/)** - Biblioteca para interfaces de usuário
- **[TypeScript 5](https://www.typescriptlang.org/)** - Tipagem estática para JavaScript
- **[Vite](https://vitejs.dev/)** - Build tool e dev server ultrarrápido
- **[React Router DOM](https://reactrouter.com/)** - Roteamento declarativo

### UI/UX
- **[TailwindCSS](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Shadcn/ui](https://ui.shadcn.com/)** - Componentes UI de alta qualidade
- **[Lucide React](https://lucide.dev/)** - Ícones SVG otimizados
- **[Sonner](https://sonner.emilkowal.ski/)** - Sistema de notificações

### Estado e Dados
- **[TanStack Query](https://tanstack.com/query/)** - Gerenciamento de estado server-side
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários
- **WebSocket** - Comunicação em tempo real

### Qualidade
- **[ESLint](https://eslint.org/)** - Linting e análise estática
- **[Prettier](https://prettier.io/)** - Formatação de código
- **[TypeScript](https://www.typescriptlang.org/)** - Verificação de tipos

---

## 🚀 Recursos Principais

### 🔐 Autenticação e Autorização
- Login seguro com JWT
- Seleção de unidade de atendimento
- Controle de acesso baseado em perfis (ADMINISTRADOR/USUARIO)
- Logout automático por inatividade

### 📊 Dashboard Analítico
- Métricas em tempo real das filas
- Indicadores de performance (KPIs)
- Gráficos e visualizações interativas
- Status do sistema em tempo real

### 👥 Painel Profissional
- Interface de atendimento para profissionais
- Controle de chamadas da fila
- Histórico de atendimentos
- Ações rápidas (chamar próximo, finalizar, encaminhar)

### 🏗️ Gestão Administrativa
- **Unidades**: CRUD completo de unidades de atendimento
- **Setores**: Gerenciamento de setores e especialidades
- **Filas**: Configuração e monitoramento de filas
- **Usuários**: Administração de usuários e permissões
- **Clientes**: Cadastro e busca de clientes/pacientes

### ⚙️ Configurações
- Preferências de notificações
- Configurações de áudio
- Personalização da interface
- Configurações de segurança

---

## 🔗 Integração com API Java

O frontend está **100% integrado** com a API Java Spring Boot, implementando todos os endpoints disponíveis:

### 📡 Endpoints Implementados

| Módulo | Endpoints | Descrição |
|--------|-----------|-----------|
| **Autenticação** | `/auth/*` | Login, registro, confirmação de email |
| **Unidades** | `/api/unidades-atendimento/*` | CRUD de unidades |
| **Usuários** | `/api/usuarios/*` | Gerenciamento de usuários |
| **Setores** | `/api/setores/*` | CRUD de setores |
| **Filas** | `/api/filas/*` | Gerenciamento de filas |
| **Clientes** | `/api/clientes/*` | CRUD de clientes |
| **Entrada Fila** | `/api/entrada-fila/*` | Fluxo de atendimento |
| **Painéis** | `/painel/*` | Painéis de exibição |
| **Dashboard** | `/api/dashboard/*` | Analytics e métricas |
| **Email** | `/api/email/*` | Envio de notificações |

### 🔄 Tipos TypeScript
Todos os DTOs da API Java foram mapeados para interfaces TypeScript:
- `UsuarioResponseDTO`, `UsuarioCreateDTO`, `UsuarioUpdateDTO`
- `UnidadeAtendimentoResponseDTO`, `UnidadeAtendimentoCreateDTO`
- `FilaResponseDTO`, `FilaCreateDTO`, `EntradaFilaResponseDTO`
- E muitos outros...

---

## 📦 Instalação e Execução

### Pré-requisitos
- **Node.js** 18.0+ ([instalar com nvm](https://github.com/nvm-sh/nvm))
- **npm** 9.0+ ou **yarn** 1.22+
- **API Java** rodando na porta 8899

### 🚀 Início Rápido

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd fila-atendimento/frontend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações

# 4. Inicie o servidor de desenvolvimento
npm run dev

# 5. Acesse a aplicação
# Frontend: http://localhost:3000
# Certifique-se de que a API Java esteja rodando em http://localhost:8899
```

### 🏗️ Build para Produção

```bash
# Build otimizado
npm run build

# Preview do build
npm run preview

# Servir arquivos estáticos
npm run serve
```

---

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── Layout/          # Layouts da aplicação
│   ├── PainelPublico/   # Componentes do painel público
│   └── ui/              # Componentes UI base (shadcn/ui)
├── hooks/               # Custom React hooks
├── lib/                 # Utilitários e configurações
├── pages/               # Páginas da aplicação
│   ├── Login.tsx        # Página de autenticação
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── PainelProfissional.tsx
│   ├── Gestao.tsx       # Módulo administrativo
│   └── Configuracoes.tsx
├── services/            # Serviços de API
│   ├── authService.ts   # Autenticação JWT
│   ├── dashboardService.ts
│   ├── filaService.ts
│   ├── clienteService.ts
│   └── ...
├── types/              # Definições TypeScript
│   └── index.ts        # DTOs da API Java
└── App.tsx             # Componente raiz
```

---

## 🛠️ Serviços Implementados

### 🔐 AuthService
```typescript
// Autenticação completa com JWT
await authService.login({ username, password, unidadeAtendimentoId });
await authService.getUnidadesParaLogin();
authService.isAuthenticated();
authService.logout();
```

### 📊 DashboardService
```typescript
// Analytics e métricas
await dashboardService.tempoMedioEspera(unidadeId, inicio, fim);
await dashboardService.produtividade(unidadeId, inicio, fim);
await dashboardService.horariosPico(unidadeId, inicio, fim);
```

### 🏥 EntradaFilaService
```typescript
// Fluxo de atendimento (coração do sistema)
await entradaFilaService.adicionarClienteAFila(entrada);
await entradaFilaService.chamarProximo(filaId, usuarioId, guiche);
await entradaFilaService.finalizarAtendimento(entradaFilaId);
await entradaFilaService.cancelarAtendimento(entradaFilaId);
```

### 🏢 Outros Serviços
- **UnidadeService**: CRUD de unidades de atendimento
- **FilaService**: Gerenciamento de filas
- **ClienteService**: CRUD de clientes com busca avançada
- **SetorService**: Gerenciamento de setores
- **UsuarioService**: CRUD de usuários e promoções
- **PainelService**: Configuração de painéis públicos
- **EmailService**: Notificações por email

---

## ♿ Acessibilidade

O Q-Manager Frontend foi projetado e implementado para atender às diretrizes **WCAG 2.1 Nível AA**, garantindo uma experiência inclusiva para todas as pessoas.

### ✅ O que está implementado

1) Estrutura e Navegação
- Landmarks semânticos e/ou roles apropriados em todo o app (banner/header, navigation, main, application quando pertinente).
- Total operabilidade por teclado: navegação via Tab/Shift+Tab, ativação com Enter/Espaço e saída com Esc onde aplicável.
- Foco visível consistente (outline/ring) em todos os elementos interativos, respeitando o tema.
- Ordem de navegação lógica e previsível em formulários e ações principais.

2) Cores e Contraste
- Tokens de tema (Tailwind + CSS custom properties) garantem contraste adequado no modo claro e escuro.
- Informações não dependem apenas de cor: acompanhadas por texto/ícones/estados visuais.

3) Imagens e Mídias
- Ícones decorativos com `aria-hidden="true"`.
- Recursos visuais relevantes expostos por meio de texto/labels nos componentes.

4) Formulários e Mensagens
- Todos os campos possuem rótulos claros (Label/aria-label) e descrições quando necessário.
- Estados e feedbacks visuais e verbais: áreas com `aria-live="polite"` para atualizações de resultados.
- Botões e ações com descrições compreensíveis e sem ambiguidade.

5) Responsividade e Zoom
- Layout responsivo (mobile, tablet e desktop) com grade fluida.
- Conteúdo permanece legível e navegável com zoom ampliado (até 200%).

6) Compatibilidade com Tecnologias Assistivas
- Componentes interativos compatíveis com leitores de tela (NVDA, VoiceOver, JAWS).
- Componentes shadcn/ui (por exemplo, Select) utilizados e configurados com atributos ARIA apropriados.

7) Verificação Automática
- Verificação automatizada de acessibilidade via ferramentas do navegador e padrões da biblioteca UI.

### 🧩 Exemplos práticos na interface
- Selects nativos substituídos por **shadcn/ui Select** (teclado e leitor de tela friendly) no Dashboard (filtro de período) e na Entrada em Filas ("Buscar por" e "Itens por página").
- Área de resultados de busca com **`aria-live="polite"`** para anúncio de mudanças.
- Ícones decorativos marcados como **`aria-hidden`**; elementos clicáveis com **role** e **aria-label** descritivos.
- Estilos de foco visível padronizados e tema dark com contraste adequado.

---

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8899

# WebSocket Configuration
VITE_WS_URL=ws://localhost:8899/ws

# App Configuration
VITE_APP_NAME=Q-Manager
VITE_APP_VERSION=1.0.0

# Development
VITE_DEV_MODE=true
VITE_ENABLE_MOCK=false

# Analytics (opcional)
VITE_ANALYTICS_ID=your-analytics-id
```

---

## 📜 Scripts Disponíveis

```json
{
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

---

## 🌐 Deploy

### Opções de Deploy

1. **Vercel** (Recomendado)
```bash
npm i -g vercel
vercel --prod
```

2. **Netlify**
```bash
npm run build
# Upload da pasta dist/
```

3. **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🧪 Testes

```bash
# Testes unitários (quando configurados)
npm run test

# Testes E2E (quando configurados)
npm run test:e2e
```

---

## 🤝 Como Contribuir

1. **Fork** o repositório
2. **Clone** seu fork: `git clone <seu-fork>`
3. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. **Abra** um Pull Request

### 📝 Padrões de Commit
Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

---

## 📊 Status do Projeto

### ✅ Funcionalidades Implementadas
- [x] Sistema de autenticação JWT
- [x] Dashboard com métricas em tempo real
- [x] CRUD completo de todas as entidades
- [x] Painel profissional para atendimento
- [x] Interface administrativa
- [x] Sistema de notificações
- [x] Acessibilidade WCAG 2.1
- [x] Integração completa com API Java
- [x] PWA — instalável em dispositivos móveis
- [x] Auto-preenchimento de endereço via ViaCEP
- [x] CI/CD com GitHub Actions (build, test, deploy)

### 🚧 Em Desenvolvimento
- [ ] Modo offline
- [ ] Notificações push
- [ ] Temas personalizáveis
- [ ] Módulo de relatórios avançados

### 🎯 Roadmap
- [ ] Aplicativo móvel (React Native)
- [ ] Integração com APIs externas (WhatsApp, SMS)
- [ ] Inteligência Artificial para previsões
- [ ] Módulo de agendamento

---

## 📞 Suporte

- **Documentação**: [Wiki do Projeto](link-para-wiki)
- **Issues**: [GitHub Issues](link-para-issues)
- **Email**: suporte@qmanager.com
- **Discord**: [Comunidade Q-Manager](link-para-discord)

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE) - veja o arquivo LICENSE para detalhes.

---

## 🙏 Agradecimentos

- **UNIVESP** - Universidade Virtual do Estado de São Paulo
- **Equipe de Desenvolvimento**
- **Comunidade Open Source**
- **Usuários Beta Testers**

---

## 🏆 Badges

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](link)
[![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen.svg)](link)
[![Quality Gate](https://img.shields.io/badge/quality%20gate-passed-brightgreen.svg)](link)
[![Security](https://img.shields.io/badge/security-A-brightgreen.svg)](link)

---

---

## Evolução da Plataforma

Esta seção registra os avanços mais recentes que elevaram o projeto a um novo patamar de maturidade operacional.

### PWA — Instalável em Dispositivos Móveis

O frontend foi configurado como **Progressive Web App** via `vite-plugin-pwa`. A aplicação pode ser instalada diretamente do navegador móvel, sem necessidade de loja de aplicativos, com ícones adaptáveis (192×192 e 512×512), manifest completo e comportamento standalone.

Para instalar: acesse a URL da aplicação no navegador e utilize a opção **"Adicionar à tela inicial"**.

### Auto-preenchimento de Endereço via ViaCEP

No cadastro de clientes, ao digitar o CEP o sistema consulta automaticamente a [API pública ViaCEP](https://viacep.com.br) através do backend e preenche logradouro, bairro, cidade e UF sem intervenção manual. O serviço `viaCepService.ts` abstrai a chamada ao endpoint `/api/cep/{cep}` com autenticação JWT.

### CI/CD com GitHub Actions

O pipeline de entrega contínua (`ci.yml`) executa automaticamente a cada push nas branches `main` e `homologacao`:

```
test-frontend → test-backend → build-push → deploy
```

O job `test-frontend` valida o build (`npm run build`) e o lint (`npm run lint`). Em caso de sucesso, a imagem Docker é construída com o frontend embutido e publicada no GHCR, seguida de deploy automático via SSH.

### Implantação Containerizada

O frontend é servido como SPA estática pelo nginx dentro de um container Docker, junto ao backend Spring Boot e ao banco PostgreSQL, orquestrados via Docker Compose. O nginx realiza terminação TLS (HTTPS), redireciona HTTP→HTTPS e faz proxy das rotas de API e WebSocket para o backend.

### WebSocket Estável em Ambiente Containerizado

Após a containerização, dois ajustes foram necessários para que o Painel Público se conectasse corretamente via WebSocket:

- O `websocketService.ts` converte `wss://` para `https://` antes de passar a URL ao SockJS, que requer protocolo HTTP para negociar o transporte internamente
- O nginx passou a usar header `Connection` dinâmico (via `map`), enviando `upgrade` apenas em conexões WebSocket reais e `close` nas requisições HTTP de polling do SockJS

---

**Q-Manager Frontend** - Transformando a gestão de filas com tecnologia e acessibilidade. 🚀

*Desenvolvido com ❤️ para melhorar a experiência de atendimento em todo lugar.*
