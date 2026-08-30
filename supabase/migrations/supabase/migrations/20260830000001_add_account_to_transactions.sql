-- FinanLook
-- Parte 2: Vincular movimentações às contas

alter table public.transactions
add column if not exists account_id uuid;

alter table public.transactions
drop constraint if exists transactions_account_id_fkey;

alter table public.transactions
add constraint transactions_account_id_fkey
foreign key (account_id)
references public.accounts(id)
on delete restrict;

create index if not exists transactions_account_id_idx
on public.transactions(account_id);

create index if not exists transactions_user_id_account_id_idx
on public.transactions(user_id, account_id);

-- Garante que uma movimentação só possa apontar
-- para uma conta pertencente ao mesmo usuário.
create or replace function public.transaction_account_belongs_to_user()
returns trigger
language plpgsql
as $$
begin
  if new.account_id is not null then
    if not exists (
      select 1
      from public.accounts a
      where a.id = new.account_id
        and a.user_id = new.user_id
    ) then
      raise exception 'A conta não pertence ao usuário da movimentação.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists transactions_validate_account
on public.transactions;

create trigger transactions_validate_account
before insert or update on public.transactions
for each row
execute function public.transaction_account_belongs_to_user();