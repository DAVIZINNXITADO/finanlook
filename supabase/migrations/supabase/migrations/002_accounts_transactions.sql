-- FinanLook
-- Parte 2: Vincular movimentações às contas

alter table public.transactions
add column if not exists account_id uuid;

alter table public.transactions
add constraint transactions_account_id_fkey
foreign key (account_id)
references public.accounts(id)
on delete set null;

create index if not exists transactions_account_id_idx
on public.transactions(account_id);

-- RLS continua sendo controlado pela própria movimentação.
-- A conta vinculada precisa pertencer ao mesmo usuário.