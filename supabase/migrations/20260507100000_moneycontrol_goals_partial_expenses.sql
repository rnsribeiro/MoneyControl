alter table public.mc_expenses
  add column if not exists paid_amount numeric(12, 2) not null default 0;

update public.mc_expenses
set paid_amount = case
  when status = 'paid' then amount
  else 0
end
where paid_amount = 0;

alter table public.mc_expenses
  drop constraint if exists mc_expenses_status_check;

alter table public.mc_expenses
  add constraint mc_expenses_status_check
  check (status in ('paid', 'pending', 'partial'));

update public.mc_expenses
set status = case
  when paid_amount >= amount then 'paid'
  when paid_amount > 0 then 'partial'
  else 'pending'
end;

alter table public.mc_expenses
  drop constraint if exists mc_expenses_paid_amount_check;

alter table public.mc_expenses
  add constraint mc_expenses_paid_amount_check
  check (paid_amount >= 0 and paid_amount <= amount);

create table if not exists public.mc_goals (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  target_date date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists mc_goals_user_id_target_date_idx
  on public.mc_goals (user_id, target_date desc nulls last, created_at desc);

drop trigger if exists mc_goals_set_updated_at on public.mc_goals;
create trigger mc_goals_set_updated_at
before update on public.mc_goals
for each row
execute function public.mc_set_updated_at();

alter table public.mc_goals enable row level security;

drop policy if exists "mc_goals_select_own" on public.mc_goals;
create policy "mc_goals_select_own"
on public.mc_goals
for select
using (auth.uid() = user_id);

drop policy if exists "mc_goals_insert_own" on public.mc_goals;
create policy "mc_goals_insert_own"
on public.mc_goals
for insert
with check (auth.uid() = user_id);

drop policy if exists "mc_goals_update_own" on public.mc_goals;
create policy "mc_goals_update_own"
on public.mc_goals
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "mc_goals_delete_own" on public.mc_goals;
create policy "mc_goals_delete_own"
on public.mc_goals
for delete
using (auth.uid() = user_id);
