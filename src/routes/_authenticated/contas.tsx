import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

import { supabase } from "@/integrations/supabase/client";
import { formatBRL, parseAmount } from "@/lib/finance";
import type { Database } from "@/integrations/supabase/types";

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

type Account = Database["public"]["Tables"]["accounts"]["Row"];

type AccountForm = {
  name: string;
  type: string;
  initialBalance: string;
};

const ACCOUNT_TYPES = [
  {
    value: "conta",
    label: "Conta corrente",
  },
  {
    value: "poupanca",
    label: "Poupança",
  },
  {
    value: "carteira",
    label: "Carteira",
  },
  {
    value: "outro",
    label: "Conta digital",
  },
  {
    value: "outro",
    label: "Outro",
  },
] as const;

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Sessão expirada. Entre novamente.");
  }

  return data.user.id;
}

function getAccountTypeLabel(type: string): string {
  const found = ACCOUNT_TYPES.find(
    (accountType) => accountType.value === type,
  );

  return found?.label ?? "Outro";
}

function AccountsPage() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [deleting, setDeleting] = useState<Account | null>(null);
  const [showBalances, setShowBalances] = useState(true);

  const [form, setForm] = useState<AccountForm>({
    name: "",
    type: "conta",
    initialBalance: "",
  });

  /*
   * =========================================================
   * CONTAS
   * =========================================================
   */

  const {
    data: accounts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: async (): Promise<Account[]> => {
      const user_id = await requireUserId();

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });

  /*
   * =========================================================
   * ADICIONAR / EDITAR
   * =========================================================
   */

  const saveAccount = useMutation({
    mutationFn: async ({
      id,
      name,
      type,
      initialBalance,
    }: {
      id?: string;
      name: string;
      type: string;
      initialBalance: number;
    }) => {
      const user_id = await requireUserId();

      if (id) {
        const { error } = await supabase
          .from("accounts")
          .update({
            name,
            type,
            initial_balance: initialBalance,
          })
          .eq("id", id)
          .eq("user_id", user_id);

        if (error) {
          throw error;
        }

        return;
      }

      const { error } = await supabase
        .from("accounts")
        .insert({
          user_id,
          name,
          type,
          initial_balance: initialBalance,
          balance_adjustment: 0,
        });

      if (error) {
        throw error;
      }
    },

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      toast.success(
        variables.id
          ? "Conta atualizada."
          : "Conta adicionada.",
      );

      setOpen(false);
      setEditing(null);
    },

    onError: (error) => {
      console.error(error);

      toast.error(
        "Não foi possível salvar a conta.",
      );
    },
  });

  /*
   * =========================================================
   * EXCLUIR
   * =========================================================
   */

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const user_id = await requireUserId();

      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", id)
        .eq("user_id", user_id);

      if (error) {
        throw error;
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      toast.success("Conta removida.");

      setDeleting(null);
    },

    onError: (error) => {
      console.error(error);

      toast.error(
        "Não foi possível remover a conta.",
      );
    },
  });

  /*
   * =========================================================
   * FORMULÁRIO
   * =========================================================
   */

  function openNew() {
    setEditing(null);

    setForm({
      name: "",
      type: "conta",
      initialBalance: "",
    });

    setOpen(true);
  }

  function openEdit(account: Account) {
    setEditing(account);

    setForm({
      name: account.name,
      type: account.type,
      initialBalance: String(
        account.initial_balance,
      ).replace(".", ","),
    });

    setOpen(true);
  }

  function handleSave() {
    const name = form.name.trim();
    const balance = parseAmount(
      form.initialBalance,
    );

    if (!name) {
      toast.error(
        "Informe o nome da conta.",
      );
      return;
    }

    if (balance < 0) {
      toast.error(
        "O saldo não pode ser negativo.",
      );
      return;
    }

    saveAccount.mutate({
      id: editing?.id,
      name,
      type: form.type,
      initialBalance: balance,
    });
  }

  /*
   * =========================================================
   * SALDOS
   * =========================================================
   *
   * Por enquanto:
   *
   * saldo = saldo inicial + ajuste manual
   *
   * Na próxima etapa vamos ligar movimentações à conta
   * através de account_id.
   *
   * Aí ficará:
   *
   * saldo =
   * saldo inicial
   * + entradas
   * - saídas
   * + ajuste manual
   *
   * Isso permite corrigir o saldo quando houver diferença
   * entre o cálculo do sistema e o saldo real.
   */

  const accountBalances = accounts.map(
    (account) => ({
      ...account,
      balance:
        Number(account.initial_balance) +
        Number(account.balance_adjustment),
    }),
  );

  const totalBalance = accountBalances.reduce(
    (total, account) =>
      total + account.balance,
    0,
  );

  /*
   * =========================================================
   * CARREGANDO
   * =========================================================
   */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Minhas contas"
          subtitle="Veja onde seu dinheiro está e organize seus saldos."
        />

        <section className="surface p-6">
          <p className="text-sm text-muted-foreground">
            Carregando suas contas...
          </p>
        </section>
      </div>
    );
  }

  /*
   * =========================================================
   * ERRO
   * =========================================================
   */

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Minhas contas"
          subtitle="Veja onde seu dinheiro está e organize seus saldos."
        />

        <section className="surface p-6">
          <p className="font-medium">
            Não foi possível carregar suas contas.
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Verifique sua sessão e tente novamente.
          </p>

          <Button
            className="mt-4"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["accounts"],
              })
            }
          >
            Tentar novamente
          </Button>
        </section>
      </div>
    );
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

      {/* =====================================================
          SALDO TOTAL
          ===================================================== */}

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
              setShowBalances(
                (value) => !value,
              )
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

      {/* =====================================================
          LISTA DE CONTAS
          ===================================================== */}

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
          {accountBalances.map(
            (account) => (
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
                        {getAccountTypeLabel(
                          account.type,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar conta"
                      onClick={() =>
                        openEdit(account)
                      }
                    >
                      <Pencil className="size-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Excluir conta"
                      onClick={() =>
                        setDeleting(account)
                      }
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
                      ? formatBRL(
                          account.balance,
                        )
                      : "R$ •••••"}
                  </p>

                  {Number(
                    account.balance_adjustment,
                  ) !== 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Inclui ajuste manual de{" "}
                      {formatBRL(
                        account.balance_adjustment,
                      )}
                    </p>
                  )}
                </div>
              </article>
            ),
          )}
        </section>
      )}

      {/* =====================================================
          CONECTAR BANCO
          ===================================================== */}

      <section className="surface p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Conectar banco
          </h2>

          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Em breve você poderá conectar uma conta
            bancária usando Open Finance e importar
            suas informações automaticamente.
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
          Essa função será ativada quando a
          integração bancária estiver configurada.
        </p>
      </section>

      {/* =====================================================
          DICA
          ===================================================== */}

      <section className="rounded-2xl bg-accent/50 p-5">
        <h2 className="font-display text-base font-semibold">
          💡 Dica
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre suas contas com o saldo que elas
          têm atualmente. Depois, cada movimentação
          poderá ser vinculada à conta correspondente
          para atualizar o saldo automaticamente.
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

      {/* =====================================================
          DIALOG — ADICIONAR / EDITAR
          ===================================================== */}

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (saveAccount.isPending) return;
          setOpen(value);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? "Editar conta"
                : "Adicionar conta"}
            </DialogTitle>

            <DialogDescription>
              Cadastre uma conta para acompanhar seu
              saldo no FinanLook.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* NOME */}

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

            {/* TIPO */}

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
                {ACCOUNT_TYPES.map(
                  (type, index) => (
                    <option
                      key={`${type.value}-${type.label}-${index}`}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* SALDO */}

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
                    initialBalance:
                      event.target.value,
                  }))
                }
              />

              <p className="text-xs text-muted-foreground">
                Informe quanto você tem nessa conta
                agora.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              onClick={handleSave}
              disabled={
                saveAccount.isPending
              }
            >
              {saveAccount.isPending
                ? "Salvando..."
                : editing
                  ? "Salvar alterações"
                  : "Adicionar conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =====================================================
          CONFIRMAR EXCLUSÃO
          ===================================================== */}

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(value) => {
          if (!value) {
            setDeleting(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remover conta?
            </AlertDialogTitle>

            <AlertDialogDescription>
              {deleting
                ? `A conta "${deleting.name}" será removida permanentemente.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={
                deleteAccount.isPending
              }
            >
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={
                deleteAccount.isPending
              }
              onClick={(event) => {
                event.preventDefault();

                if (!deleting) return;

                deleteAccount.mutate(
                  deleting.id,
                );
              }}
            >
              {deleteAccount.isPending
                ? "Removendo..."
                : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}