-- =========================================================
-- FinanLook
-- Parte 4: ligar movimentações às contas
-- =========================================================

alter table public.transactions
add column if not exists account_id uuid;

-- =========================================================
-- Relacionamento com accounts
-- =========================================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_account_id_fkey'
  ) then
    alter table public.transactions
      add constraint transactions_account_id_fkey
      foreign key (account_id)
      references public.accounts(id)
      on delete set null;
  end if;
end
$$;

-- =========================================================
-- Índice
-- =========================================================

create index if not exists transactions_account_id_idx
  on public.transactions(account_id);

-- =========================================================
-- Segurança:
-- uma movimentação só pode ser ligada a uma conta
-- pertencente ao mesmo usuário
-- =========================================================

create or replace function public.validate_transaction_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.account_id is not null then
    if not exists (
      select 1
      from public.accounts a
      where a.id = new.account_id
        and a.user_id = new.user_id
    ) then
      raise exception
        'A conta selecionada não pertence ao usuário da movimentação.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists transactions_validate_account
on public.transactions;

create trigger transactions_validate_account
before insert or update of account_id, user_id
on public.transactions
for each row
execute function public.validate_transaction_account();