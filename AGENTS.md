# Agentes do Projeto Next.js + Supabase + Mobile Kotlin

Este projeto possui quatro perfis principais:

1. Especialista Frontend
2. Especialista em Desenvolvimento Next.js + Supabase
3. Especialista em Testes/QA
4. Especialista em Desenvolvimento Mobile Kotlin

---

# 1. Especialista Frontend

Use este perfil quando a tarefa envolver:
- React
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Componentes visuais
- Layouts, telas, responsividade e UX/UI
- Temas claro/escuro
- Formulários
- Estados de loading, erro e vazio
- Acessibilidade

Regras:
- Criar interfaces modernas, responsivas e acessíveis.
- Usar componentes reutilizáveis quando houver repetição.
- Separar componentes grandes em partes menores.
- Evitar lógica pesada dentro dos componentes visuais.
- Manter padrão visual consistente em todo o projeto.
- Priorizar boa experiência do usuário em desktop e mobile.
- Usar TypeScript de forma clara e segura.
- Evitar componentes excessivamente complexos.
- Usar Tailwind CSS de forma organizada.
- Usar shadcn/ui quando fizer sentido para manter consistência visual.
- Garantir bom contraste entre texto, fundo, botões e cards.
- Criar estados visuais para:
  - carregando;
  - erro;
  - lista vazia;
  - sucesso;
  - formulário inválido.

Boas práticas:
- Componentes visuais devem focar em apresentação.
- Lógica de busca, autenticação e banco deve ficar fora da UI sempre que possível.
- Criar componentes como `Card`, `Table`, `Form`, `Modal`, `Button`, `Input` e `EmptyState` quando houver repetição.
- Evitar duplicação de layout.
- Manter nomes claros para componentes e props.

---

# 2. Especialista em Desenvolvimento Next.js + Supabase

Use este perfil quando a tarefa envolver:
- Next.js
- App Router
- Server Components
- Client Components
- Route Handlers
- Server Actions
- Supabase Auth
- Supabase Database
- Supabase Storage
- Row Level Security — RLS
- APIs
- Regras de negócio
- Integração frontend/backend
- Middleware
- Autenticação e autorização
- CRUD
- Validação de dados
- Organização de pastas
- Deploy

Regras:
- Seguir boas práticas do Next.js com App Router.
- Separar corretamente Server Components e Client Components.
- Usar `"use client"` apenas quando necessário.
- Evitar expor chaves sensíveis no frontend.
- Nunca usar `SUPABASE_SERVICE_ROLE_KEY` no client.
- Usar variáveis de ambiente corretamente.
- Centralizar a criação dos clients do Supabase.
- Validar dados recebidos antes de salvar no banco.
- Manter código limpo, organizado e reutilizável.
- Evitar duplicação de lógica.
- Criar funções auxiliares para operações repetidas.
- Não alterar estrutura do banco sem necessidade.
- Manter nomes claros e coerentes.
- Priorizar segurança, principalmente em autenticação e permissões.
- Respeitar as políticas de RLS do Supabase.
- Evitar queries desnecessárias.
- Buscar apenas os campos necessários do banco.
- Tratar erros de forma clara e segura.

Estrutura preferida:
- `app/` concentra rotas, páginas, layouts e route handlers.
- `components/` concentra componentes reutilizáveis.
- `lib/` concentra clients, helpers, validações e funções auxiliares.
- `types/` concentra tipos TypeScript compartilhados.
- `hooks/` concentra hooks usados em Client Components.
- `utils/` concentra funções genéricas.
- `middleware.ts` trata autenticação e proteção de rotas quando necessário.

Exemplo de organização:

```txt
src/
  app/
    dashboard/
      page.tsx
    login/
      page.tsx
    api/
      exemplo/
        route.ts

  components/
    ui/
    forms/
    layout/

  lib/
    supabase/
      client.ts
      server.ts
      admin.ts
    validations/
    services/

  hooks/
  types/
  utils/