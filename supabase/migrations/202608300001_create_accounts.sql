-- ACCOUNTS

CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  user_id UUID NOT NULL
    REFERENCES auth.users ON DELETE CASCADE,

  name TEXT NOT NULL,

  institution TEXT,

  type TEXT NOT NULL DEFAULT 'corrente'
    CHECK (
      type IN (
        'corrente',
        'poupanca',
        'carteira',
        'dinheiro',
        'investimento',
        'outro'
      )
    ),

  balance NUMERIC(14,2) NOT NULL DEFAULT 0
    CHECK (balance >= 0),

  is_primary BOOLEAN NOT NULL DEFAULT false,

  is_open_finance BOOLEAN NOT NULL DEFAULT false,

  open_finance_status TEXT
    CHECK (
      open_finance_status IS NULL OR
      open_finance_status IN (
        'connected',
        'pending',
        'expired',
        'error',
        'disconnected'
      )
    ),

  last_synced_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.accounts
TO authenticated;

GRANT ALL
ON public.accounts
TO service_role;

ALTER TABLE public.accounts
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own accounts"
ON public.accounts
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

CREATE INDEX accounts_user_idx
ON public.accounts(user_id);

CREATE INDEX accounts_user_created_idx
ON public.accounts(user_id, created_at DESC);

CREATE UNIQUE INDEX accounts_primary_idx
ON public.accounts(user_id)
WHERE is_primary = true;

CREATE TRIGGER t_accounts_updated
BEFORE UPDATE
ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();