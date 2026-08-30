-- =========================================================
-- FINANLOOK — CONTAS
-- =========================================================

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null,
  institution text,
  type text not null default 'corrente',

  balance numeric(14,2) not null default 0,

  is_primary boolean not null default false,

  is_open_finance boolean not null default false,

  open_finance_status text,

  last_synced_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint accounts_type_check
    check (
      type in (
        'corrente',
        'poupanca',
        'carteira',
        'dinheiro',
        'investimento',
        'outro'
      )
    ),

  constraint accounts_balance_check
    check (balance >= 0),

  constraint accounts_open_finance_status_check
    check (
      open_finance_status is null
      or open_finance_status in (
        'connected',
        'pending',
        'expired',
        'error',
        'disconnected'
      )
    )
);

-- =========================================================
-- ÍNDICES
-- =========================================================

create index if not exists accounts_user_id_idx
  on public.accounts(user_id);

create index if not exists accounts_user_id_created_at_idx
  on public.accounts(user_id, created_at desc);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.accounts enable row level security;

-- Usuário só pode visualizar as próprias contas
drop policy if exists "Users can view own accounts"
  on public.accounts;

create policy "Users can view own accounts"
on public.accounts
for select
to authenticated
using (
  auth.uid() = user_id
);

-- Usuário só pode criar conta para ele mesmo
drop policy if exists "Users can insert own accounts"
  on public.accounts;

create policy "Users can insert own accounts"
on public.accounts
for insert
to authenticated
with check (
  auth.uid() = user_id
);

-- Usuário só pode alterar as próprias contas
drop policy if exists "Users can update own accounts"
  on public.accounts;

create policy "Users can update own accounts"
on public.accounts
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

-- Usuário só pode excluir as próprias contas
drop policy if exists "Users can delete own accounts"
  on public.accounts;

create policy "Users can delete own accounts"
on public.accounts
for delete
to authenticated
using (
  auth.uid() = user_id
);

-- =========================================================
-- UPDATED_AT AUTOMÁTICO
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

drop trigger if exists accounts_set_updated_at
  on public.accounts;

create trigger accounts_set_updated_at
before update on public.accounts
for each row
execute function public.set_accounts_updated_at();

-- =========================================================
-- GARANTE APENAS UMA CONTA PRINCIPAL POR USUÁRIO
-- =========================================================

create unique index if not exists accounts_one_primary_per_user
on public.accounts(user_id)
where is_primary = true;