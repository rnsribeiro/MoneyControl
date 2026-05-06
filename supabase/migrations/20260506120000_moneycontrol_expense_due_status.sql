alter table public.mc_expenses
  add column if not exists due_date date;

alter table public.mc_expenses
  add column if not exists paid_at date;

update public.mc_expenses
set due_date = coalesce(due_date, expense_date)
where due_date is null;

update public.mc_expenses
set status = 'pending'
where status = 'scheduled';

alter table public.mc_expenses
  drop constraint if exists mc_expenses_status_check;

alter table public.mc_expenses
  add constraint mc_expenses_status_check
  check (status in ('paid', 'pending'));

update public.mc_expenses
set paid_at = coalesce(paid_at, expense_date, due_date)
where status = 'paid'
  and paid_at is null;

alter table public.mc_expenses
  alter column due_date set not null;
