create table if not exists public.mc_categories (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null,
  kind text not null check (kind in ('expense', 'income', 'investment')),
  color text,
  icon text,
  is_system boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint mc_categories_user_slug_kind_key unique (user_id, slug, kind)
);

create table if not exists public.mc_incomes (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  amount numeric(12, 2) not null check (amount > 0),
  source text not null,
  received_at date not null default current_date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.mc_expenses (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  amount numeric(12, 2) not null check (amount > 0),
  category_id uuid references public.mc_categories (id) on delete set null,
  category_name text not null,
  payment_method text not null,
  status text not null default 'paid' check (status in ('paid', 'scheduled')),
  expense_date date not null default current_date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.mc_investments (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null,
  amount numeric(12, 2) not null check (amount > 0),
  broker text not null,
  goal text not null,
  investment_date date not null default current_date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists mc_categories_user_id_idx
  on public.mc_categories (user_id, kind);

create index if not exists mc_incomes_user_id_received_at_idx
  on public.mc_incomes (user_id, received_at desc);

create index if not exists mc_expenses_user_id_expense_date_idx
  on public.mc_expenses (user_id, expense_date desc);

create index if not exists mc_expenses_user_id_category_name_idx
  on public.mc_expenses (user_id, category_name);

create index if not exists mc_investments_user_id_investment_date_idx
  on public.mc_investments (user_id, investment_date desc);

create or replace function public.mc_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists mc_categories_set_updated_at on public.mc_categories;
create trigger mc_categories_set_updated_at
before update on public.mc_categories
for each row
execute function public.mc_set_updated_at();

drop trigger if exists mc_incomes_set_updated_at on public.mc_incomes;
create trigger mc_incomes_set_updated_at
before update on public.mc_incomes
for each row
execute function public.mc_set_updated_at();

drop trigger if exists mc_expenses_set_updated_at on public.mc_expenses;
create trigger mc_expenses_set_updated_at
before update on public.mc_expenses
for each row
execute function public.mc_set_updated_at();

drop trigger if exists mc_investments_set_updated_at on public.mc_investments;
create trigger mc_investments_set_updated_at
before update on public.mc_investments
for each row
execute function public.mc_set_updated_at();

alter table public.mc_categories enable row level security;
alter table public.mc_incomes enable row level security;
alter table public.mc_expenses enable row level security;
alter table public.mc_investments enable row level security;

drop policy if exists "mc_categories_select_own" on public.mc_categories;
create policy "mc_categories_select_own"
on public.mc_categories
for select
using (auth.uid() = user_id);

drop policy if exists "mc_categories_insert_own" on public.mc_categories;
create policy "mc_categories_insert_own"
on public.mc_categories
for insert
with check (auth.uid() = user_id);

drop policy if exists "mc_categories_update_own" on public.mc_categories;
create policy "mc_categories_update_own"
on public.mc_categories
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "mc_categories_delete_own" on public.mc_categories;
create policy "mc_categories_delete_own"
on public.mc_categories
for delete
using (auth.uid() = user_id);

drop policy if exists "mc_incomes_select_own" on public.mc_incomes;
create policy "mc_incomes_select_own"
on public.mc_incomes
for select
using (auth.uid() = user_id);

drop policy if exists "mc_incomes_insert_own" on public.mc_incomes;
create policy "mc_incomes_insert_own"
on public.mc_incomes
for insert
with check (auth.uid() = user_id);

drop policy if exists "mc_incomes_update_own" on public.mc_incomes;
create policy "mc_incomes_update_own"
on public.mc_incomes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "mc_incomes_delete_own" on public.mc_incomes;
create policy "mc_incomes_delete_own"
on public.mc_incomes
for delete
using (auth.uid() = user_id);

drop policy if exists "mc_expenses_select_own" on public.mc_expenses;
create policy "mc_expenses_select_own"
on public.mc_expenses
for select
using (auth.uid() = user_id);

drop policy if exists "mc_expenses_insert_own" on public.mc_expenses;
create policy "mc_expenses_insert_own"
on public.mc_expenses
for insert
with check (auth.uid() = user_id);

drop policy if exists "mc_expenses_update_own" on public.mc_expenses;
create policy "mc_expenses_update_own"
on public.mc_expenses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "mc_expenses_delete_own" on public.mc_expenses;
create policy "mc_expenses_delete_own"
on public.mc_expenses
for delete
using (auth.uid() = user_id);

drop policy if exists "mc_investments_select_own" on public.mc_investments;
create policy "mc_investments_select_own"
on public.mc_investments
for select
using (auth.uid() = user_id);

drop policy if exists "mc_investments_insert_own" on public.mc_investments;
create policy "mc_investments_insert_own"
on public.mc_investments
for insert
with check (auth.uid() = user_id);

drop policy if exists "mc_investments_update_own" on public.mc_investments;
create policy "mc_investments_update_own"
on public.mc_investments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "mc_investments_delete_own" on public.mc_investments;
create policy "mc_investments_delete_own"
on public.mc_investments
for delete
using (auth.uid() = user_id);
