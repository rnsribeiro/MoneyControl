# MoneyControl

MoneyControl e uma plataforma de controle financeiro pessoal com versao web e versao Android. O projeto centraliza despesas, receitas, investimentos e categorias em uma unica base Supabase, com dashboards para acompanhar caixa, valores a receber, contas pagas, contas pendentes e patrimonio.

## Links

- APK Android: [Baixar MoneyControl-v0.1.0.apk](https://github.com/rnsribeiro/MoneyControl/releases/latest/download/MoneyControl-v0.1.0.apk)
- Configuracao do Supabase: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Guia do app Android: [android/README.md](./android/README.md)

## Stack

### Web

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth + Database
- Vitest + Testing Library

### Mobile

- Kotlin
- Jetpack Compose
- Material 3
- Supabase Auth + PostgREST

## Funcionalidades

- Autenticacao com Supabase
- Dashboard com indicadores financeiros e graficos
- CRUD de despesas
- CRUD de receitas
- CRUD de investimentos
- CRUD de categorias
- Controle de despesas com vencimento e status pago/pendente
- Controle de receitas recebidas e a receber
- App Android consumindo a mesma base `mc_*` do sistema web

## Estrutura

```txt
src/                  aplicacao web em Next.js
android/              aplicativo Android em Kotlin
supabase/migrations/  migrations isoladas do MoneyControl
public/               assets da marca
```

## Banco de dados

O projeto foi preparado para compartilhar o mesmo projeto Supabase com outros sistemas sem alterar tabelas antigas. Para isso, ele usa tabelas proprias com prefixo `mc_`, como:

- `mc_categories`
- `mc_expenses`
- `mc_incomes`
- `mc_investments`

As migrations disponiveis hoje estao em `supabase/migrations/`:

- `20260506103000_moneycontrol_init.sql`
- `20260506120000_moneycontrol_expense_due_status.sql`
- `20260506130000_moneycontrol_income_status.sql`

## Variaveis de ambiente

Crie um arquivo `.env` ou `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica
SUPABASE_SERVICE_ROLE_KEY=sua-service-role
```

O `SUPABASE_SERVICE_ROLE_KEY` e usado apenas no servidor para alguns fluxos de autenticacao. Nunca use essa chave no aplicativo Android.

## Como rodar o web

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Como validar o web

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Como gerar o APK Android

```powershell
cd android
.\gradlew.bat assembleDebug
```

O APK de debug e gerado em:

```txt
android/app/build/outputs/apk/debug/app-debug.apk
```

## Observacoes

- O projeto ignora arquivos sensiveis e configuracoes locais do Android no Git.
- O app Android le as credenciais do Supabase por `android/local.properties`, variaveis de ambiente ou pelo `.env` da raiz.
- O repositorio publica o APK via GitHub Releases para facilitar testes.
