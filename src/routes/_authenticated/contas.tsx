import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { useTransactions } from "@/lib/data";
import { formatBRL, parseAmount } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/contas")({
  head: () => ({
    meta: [
      { title: "Minhas contas — FinanLook" },
      {
        name: "description",
        content:
          "Organize suas contas, acompanhe seus saldos e veja onde seu dinheiro está.",
      },
      {
        property: "og:title",
        content: "Minhas contas — FinanLook",
      },
      {
        property: "og:description",
        content:
          "Organize suas contas e acompanhe seus saldos no FinanLook.",
      },
    ],
  }),
  component: AccountsPage,
});

type Account = {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
};

type AccountForm = {
  name: string;
  type: string;
  initialBalance: string;
};

const ACCOUNT_TYPES = [
  "Conta corrente",
  "Poupança",
  "Carteira",
  "Conta digital",
  "Outro",
];

const STORAGE_KEY = "finanlook-accounts";

function loadAccounts(): Account[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

function AccountsPage() {
  const { data: transactions = [] } = useTransactions();

  const [accounts, setAccounts] = useState<Account[]>(loadAccounts);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [deleting, setDeleting] = useState<Account | null>(null);
  const [showBalances, setShowBalances] = useState(true);

  const [form, setForm] = useState<AccountForm>({
    name: "",
    type: "Conta corrente",
    initialBalance: "",
  });

  const accountBalances = useMemo(() => {
    return accounts.map((account) => {
      const movementBalance = transactions.reduce((total, transaction) => {
        /*
         * Por enquanto as movimentações ainda não possuem account_id.
         * Portanto, usamos o saldo inicial da conta.
         *
         * Quando ligarmos as movimentações às contas,
         * este cálculo será atualizado automaticamente.
         */
        void transaction;
        return total;
      }, 0);

      return {
        ...account,
        balance: account.initialBalance + movementBalance,
      };
    });
  }, [accounts, transactions]);

  const totalBalance = accountBalances.reduce(
    (total, account) => total + account.balance,
    0,
  );

  function openNew() {
    setEditing(null);

    setForm({
      name: "",
      type: "Conta corrente",
      initialBalance: "",
    });

    setOpen(true);
  }

  function openEdit(account: Account) {
    setEditing(account);

    setForm({
      name: account.name,
      type: account.type,
      initialBalance: String(account.initialBalance).replace(".", ","),
    });

    setOpen(true);
  }

  function handleSave() {
    const name = form.name.trim();
    const balance = parseAmount(form.initialBalance);

    if (!name) {
      toast.error("Informe o nome da conta.");
      return;
    }

    if (balance < 0) {
      toast.error("O saldo não pode ser negativo.");
      return;
    }

    if (editing) {
      const updated = accounts.map((account) =>
        account.id === editing.id
          ? {
              ...account,
              name,
              type: form.type,
              initialBalance: balance,
            }
          : account,
      );

      setAccounts(updated);
      saveAccounts(updated);
      toast.success("Conta atualizada.");
    } else {
      const newAccount: Account = {
        id: crypto.randomUUID(),
        name,
        type: form.type,
        initialBalance: balance,
      };

      const updated = [newAccount, ...accounts];

      setAccounts(updated);
      saveAccounts(updated);
      toast.success("Conta adicionada.");
    }

    setOpen(false);
  }

  function confirmDelete() {
    if (!deleting) return;

    const updated = accounts.filter(
      (account) => account.id !== deleting.id,
    );

    setAccounts(updated);
    saveAccounts(updated);

    setDeleting(null);

    toast.success("Conta removida.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minhas contas"
        subtitle="Veja onde seu dinheiro está e organize seus saldos."
        action={
          <Button
            className="h-11"
            onClick={openNew}
          >
            <Plus className="size-4" />
            Adicionar conta
          </Button>
        }
      />

      <section className="surface overflow-hidden p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Saldo total
            </p>

            <p className="mt-1 font-display text-3xl font-semibold">
              {showBalances
                ? formatBRL(totalBalance)
                : "R$ •••••"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Soma dos saldos das suas contas
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label={
              showBalances
                ? "Ocultar saldos"
                : "Mostrar saldos"
            }
            onClick={() =>
              setShowBalances((value) => !value)
            }
          >
            {showBalances ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </Button>
        </div>
      </section>

      {accountBalances.length === 0 ? (
        <EmptyState
          emoji="🏦"
          title="Você ainda não adicionou nenhuma conta"
          description="Cadastre suas contas para acompanhar seus saldos em um só lugar."
          action={
            <Button
              className="mt-2"
              onClick={openNew}
            >
              <Plus className="size-4" />
              Adicionar minha primeira conta
            </Button>
          }
        />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {accountBalances.map((account) => (
            <article
              key={account.id}
              className="surface p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Wallet className="size-5" />
                  </span>

                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base font-semibold">
                      {account.name}
                    </h2>

                    <p className="text-xs text-muted-foreground">
                      {account.type}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar conta"
                    onClick={() => openEdit(account)}
                  >
                    <Pencil className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir conta"
                    onClick={() => setDeleting(account)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs text-muted-foreground">
                  Saldo
                </p>

                <p className="mt-1 font-display text-2xl font-semibold">
                  {showBalances
                    ? formatBRL(account.balance)
                    : "R$ •••••"}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="surface p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Conectar banco
          </h2>

          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Em breve você poderá conectar uma conta bancária
            usando Open Finance e importar suas informações
            automaticamente.
          </p>
        </div>

        <Button
          variant="secondary"
          className="mt-4"
          disabled
        >
          🏦 Conectar banco
        </Button>

        <p className="mt-2 text-xs text-muted-foreground">
          Essa função será ativada quando a integração bancária
          estiver configurada.
        </p>
      </section>

      <section className="rounded-2xl bg-accent/50 p-5">
        <h2 className="font-display text-base font-semibold">
          💡 Dica
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Você pode cadastrar sua conta corrente, poupança,
          carteira ou conta digital. Depois vamos conectar cada
          movimentação à conta correspondente para calcular os
          saldos automaticamente.
        </p>

        <Button
          asChild
          variant="link"
          className="mt-2 h-auto p-0"
        >
          <Link to="/movimentacoes">
            Ir para movimentações →
          </Link>
        </Button>
      </section>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? "Editar conta"
                : "Adicionar conta"}
            </DialogTitle>

            <DialogDescription>
              Cadastre uma conta para acompanhar seu saldo no
              FinanLook.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome-conta">
                Nome da conta
              </Label>

              <Input
                id="nome-conta"
                className="h-11"
                placeholder="Ex.: Nubank"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tipo-conta">
                Tipo
              </Label>

              <select
                id="tipo-conta"
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="saldo-inicial">
                Saldo atual
              </Label>

              <Input
                id="saldo-inicial"
                className="h-11"
                inputMode="decimal"
                placeholder="1.500,00"
                value={form.initialBalance}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    initialBalance: event.target.value,
                  }))
                }
              />

              <p className="text-xs text-muted-foreground">
                Informe quanto você tem nessa conta agora.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              onClick={handleSave}
            >
              {editing
                ? "Salvar alterações"
                : "Adicionar conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remover conta?
            </AlertDialogTitle>

            <AlertDialogDescription>
              {deleting
                ? `A conta "${deleting.name}" será removida deste dispositivo.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDelete}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}