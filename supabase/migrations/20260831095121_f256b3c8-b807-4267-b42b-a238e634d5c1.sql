-- Contas
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'conta',
  initial_balance numeric NOT NULL DEFAULT 0,
  balance_adjustment numeric NOT NULL DEFAULT 0,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own accounts" ON public.accounts;
CREATE POLICY "own accounts" ON public.accounts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS t_accounts_updated ON public.accounts;
CREATE TRIGGER t_accounts_updated BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Movimentações: vínculo com conta e campos de importação (Open Finance)
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS institution text,
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS imported_at timestamptz,
  ADD COLUMN IF NOT EXISTS classification_status text NOT NULL DEFAULT 'confirmada',
  ADD COLUMN IF NOT EXISTS suggested_category text;
CREATE UNIQUE INDEX IF NOT EXISTS transactions_user_external_id_key
  ON public.transactions (user_id, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_account_id_idx ON public.transactions (account_id);

-- Assinatura / plano
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'inactive',
  provider text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own subscription select" ON public.subscriptions;
CREATE POLICY "own subscription select" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS t_subscriptions_updated ON public.subscriptions;
CREATE TRIGGER t_subscriptions_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Conexões Open Finance (sem credenciais bancárias)
CREATE TABLE IF NOT EXISTS public.open_finance_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_name text NOT NULL,
  provider text,
  provider_item_id text,
  status text NOT NULL DEFAULT 'pendente',
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.open_finance_connections TO authenticated;
GRANT ALL ON public.open_finance_connections TO service_role;
ALTER TABLE public.open_finance_connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own connections" ON public.open_finance_connections;
CREATE POLICY "own connections" ON public.open_finance_connections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS t_of_connections_updated ON public.open_finance_connections;
CREATE TRIGGER t_of_connections_updated BEFORE UPDATE ON public.open_finance_connections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();