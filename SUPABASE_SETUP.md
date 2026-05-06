# MoneyControl no mesmo projeto Supabase

Este projeto foi preparado para usar o mesmo Supabase que voce ja possui, sem alterar as tabelas antigas.

## Estrategia de isolamento

- todas as tabelas novas do MoneyControl usam prefixo `mc_`
- nenhuma tabela existente do outro sistema e alterada
- as policies de RLS sao aplicadas apenas nas tabelas novas
- o app usa `auth.users.id` via coluna `user_id`

## Tabelas criadas

- `public.mc_categories`
- `public.mc_incomes`
- `public.mc_expenses`
- `public.mc_investments`

## Como aplicar

Abra o SQL Editor do Supabase e execute o arquivo:

- `supabase/migrations/20260506103000_moneycontrol_init.sql`
- `supabase/migrations/20260506120000_moneycontrol_expense_due_status.sql`
- `supabase/migrations/20260506130000_moneycontrol_income_status.sql`

Ou, se voce usar Supabase CLI, rode a migration correspondente no seu fluxo habitual.

## Observacoes

- o projeto faz fallback para dados mockados caso as tabelas ainda nao existam
- depois de aplicar a migration, login, leitura e cadastro de despesas/investimentos passam a usar o banco real
- nenhuma migration deste projeto deve renomear, dropar ou alterar tabelas antigas do seu outro sistema
