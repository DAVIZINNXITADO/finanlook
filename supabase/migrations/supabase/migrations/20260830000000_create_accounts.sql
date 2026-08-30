-- FinanLook
-- Parte 1: Contas financeiras

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null,
  type text not null default 'conta',

  initial_balance numeric(14,2) not null default 0,
  balance_adjustment numeric(14,2) not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint accounts_name_not_empty
    check (length(trim(name)) > 0),

  constraint accounts_type_check
    check (
      type in (
        'conta',
        'carteira',
        'poupanca',
        'investimento',
        'outro'
      )
    )
);

-- =========================================================
-- RLS
-- =========================================================

alter table public.accounts enable row level security;

create policy "Users can view own accounts"
on public.accounts
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own accounts"
on public.accounts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own accounts"
on public.accounts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own accounts"
on public.accounts
for delete
to authenticated
using (auth.uid() = user_id);

-- =========================================================
-- Índices
-- =========================================================

create index if not exists accounts_user_id_idx
  on public.accounts(user_id);

-- =========================================================
-- updated_at
-- =========================================================

create or replace function public.set_accounts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger accounts_set_updated_at
before update on public.accounts
for each row
execute function public.set_accounts_updated_at();