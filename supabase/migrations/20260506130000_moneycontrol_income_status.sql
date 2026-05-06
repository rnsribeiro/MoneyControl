alter table public.mc_incomes
  add column if not exists expected_date date;

alter table public.mc_incomes
  add column if not exists actual_received_at date;

alter table public.mc_incomes
  add column if not exists status text;

update public.mc_incomes
set expected_date = coalesce(expected_date, received_at)
where expected_date is null;

update public.mc_incomes
set status = coalesce(status, 'received')
where status is null;

update public.mc_incomes
set actual_received_at = coalesce(actual_received_at, received_at)
where status = 'received'
  and actual_received_at is null;

alter table public.mc_incomes
  alter column expected_date set not null;

alter table public.mc_incomes
  alter column status set default 'received';

alter table public.mc_incomes
  drop constraint if exists mc_incomes_status_check;

alter table public.mc_incomes
  add constraint mc_incomes_status_check
  check (status in ('received', 'expected'));
