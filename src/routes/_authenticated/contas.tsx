import {
  createFileRoute,
} from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Landmark,
  Pencil,
  Plus,
  Trash2,
  Wallet,
  CreditCard,
  Banknote,
  Sparkles,
} from "lucide-react";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

import {
  useAccountsWithBalances,
  useDeleteAccount,
  useSaveAccount,
  type Account,
  type AccountInput,
} from "@/lib/data";

import {
  formatBRL,
  parseAmount,
} from "@/lib/finance";

export const Route = createFileRoute(
  "/_authenticated/contas",
)({
  head: () => ({
    meta: [
      {
        title: "Contas — FinanLook",
      },
      {
        name: "description",
        content:
          "Gerencie suas contas e acompanhe seus saldos no FinanLook.",
      },
      {
        property: "og:title",
        content:
          "Contas — FinanLook",
      },
      {
        property: "og:description",
        content:
          "Gerencie suas contas e acompanhe seus saldos no FinanLook.",
      },
    ],
  }),

  component: AccountsPage,
});

type FormState = {
  name: string;
  type: string;
  initial_balance: string;
  balance_adjustment: string;
  real_balance: string;
};

const emptyForm = (): FormState => ({
  name: "",
  type: "conta",
  initial_balance: "",
  balance_adjustment: "",
  real_balance: "",
});

const ACCOUNT_TYPES = [
  {
    value: "conta",
    label: "Conta bancária",
    icon: Landmark,
  },
  {
    value: "carteira",
    label: "Carteira",
    icon: Wallet,
  },
  {
    value: "cartao",
    label: "Cartão",
    icon: CreditCard,
  },
  {
    value: "dinheiro",
    label: "Dinheiro",
    icon: Banknote,
  },
  {
    value: "outros",
    label: "Outros",
    icon: Sparkles,
  },
] as const;

function getAccountTypeLabel(
  type: string,
) {
  return (
    ACCOUNT_TYPES.find(
      (item) => item.value === type,
    )?.label ?? type
  );
}

function AccountsPage() {
  const {
    data: accounts = [],
    isLoading,
    isError,
  } = useAccountsWithBalances();

  const save = useSaveAccount();
  const remove = useDeleteAccount();

  const [open, setOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<Account | null>(null);

  const [deleting, setDeleting] =
    useState<Account | null>(null);

  const [form, setForm] =
    useState<FormState>(
      emptyForm(),
    );

  const totalBalance =
    accounts.reduce(
      (total, account) =>
        total +
        account.calculatedBalance,
      0,
    );

  function openNew() {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(
    account: Account,
  ) {
    setEditing(account);

    setForm({
      name: account.name,

      type:
        account.type || "conta",

      initial_balance: String(
        Number(
          account.initial_balance,
        ),
      ).replace(".", ","),

      balance_adjustment: String(
        Number(
          account.balance_adjustment,
        ),
      ).replace(".", ","),

      real_balance: String(
        Number(
          account.calculatedBalance,
        ),
      ).replace(".", ","),
    });

    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm());
  }

  async function submit() {
    const name =
      form.name.trim();

    if (!name) {
      toast.error(
        "Informe o nome da conta.",
      );
      return;
    }

    const initialBalance =
      parseAmount(
        form.initial_balance,
      );

    if (
      !Number.isFinite(
        initialBalance,
      )
    ) {
      toast.error(
        "Informe um saldo inicial válido.",
      );
      return;
    }

    let balanceAdjustment =
      parseAmount(
        form.balance_adjustment,
      );

    if (
      !Number.isFinite(
        balanceAdjustment,
      )
    ) {
      toast.error(
        "Informe um ajuste de saldo válido.",
      );
      return;
    }

    const hasRealBalance =
      form.real_balance.trim()
        .length > 0;

    if (
      editing &&
      hasRealBalance
    ) {
      const realBalance =
        parseAmount(
          form.real_balance,
        );

      if (
        !Number.isFinite(
          realBalance,
        )
      ) {
        toast.error(
          "Informe um saldo real válido.",
        );
        return;
      }

      /*
       * Mantém todas as movimentações.
       *
       * Saldo real =
       * saldo inicial +
       * movimentações +
       * ajuste
       *
       * Portanto:
       *
       * ajuste =
       * saldo real -
       * saldo inicial -
       * movimentações
       */
      balanceAdjustment =
        realBalance -
        Number(
          editing.initial_balance,
        ) -
        editing.transactionBalance;
    }

    const values: AccountInput = {
      name:
        name.slice(
          0,
          100,
        ),

      type:
        form.type ||
        "conta",

      initial_balance:
        initialBalance,

      balance_adjustment:
        balanceAdjustment,
    };

    try {
      await save.mutateAsync({
        id:
          editing?.id,
        values,
      });

      toast.success(
        editing
          ? "Conta atualizada."
          : "Conta adicionada.",
      );

      closeDialog();
    } catch (error) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível salvar a conta. Tente novamente.",
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) {
      return;
    }

    try {
      await remove.mutateAsync(
        deleting.id,
      );

      toast.success(
        "Conta excluída. As movimentações vinculadas foram mantidas.",
      );
    } catch (error) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível excluir a conta.",
      );
    }

    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas"
        subtitle="Gerencie suas contas e acompanhe seus saldos calculados automaticamente."
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
          RESUMO
          ===================================================== */}

      <div className="surface p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Saldo total
            </p>

            <p
              className={`mt-1 text-3xl font-bold tracking-tight ${
                totalBalance >= 0
                  ? "text-success"
                  : "text-destructive"
              }`}
            >
              {formatBRL(
                totalBalance,
              )}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            {accounts.length === 1
              ? "1 conta cadastrada"
              : `${accounts.length} contas cadastradas`}
          </p>
        </div>
      </div>

      {/* =====================================================
          ESTADOS
          ===================================================== */}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          Carregando contas...
        </p>
      ) : isError ? (
        <EmptyState
          emoji="⚠️"
          title="Não foi possível carregar suas contas"
          description="Tente atualizar a página novamente."
        />
      ) : accounts.length ===
        0 ? (
        <EmptyState
          emoji="🏦"
          title="Você ainda não possui contas."
          description="Cadastre uma conta para acompanhar seus saldos e vincular movimentações."
          action={
            <Button
              onClick={openNew}
            >
              <Plus className="size-4" />
              Adicionar conta
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map(
            (account) => {
              const Icon =
                ACCOUNT_TYPES.find(
                  (item) =>
                    item.value ===
                    account.type,
                )?.icon ??
                Landmark;

              const balance =
                account.calculatedBalance;

              const isAutomaticBalance =
                account.type ===
                  "outros" &&
                account.name
                  .trim()
                  .toLowerCase() ===
                  "saldo automático";

              return (
                <div
                  key={account.id}
                  className="surface overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                        <Icon className="size-5" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {account.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {isAutomaticBalance
                                ? "Saldo geral automático"
                                : getAccountTypeLabel(
                                    account.type,
                                  )}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Editar ${account.name}`}
                              onClick={() =>
                                openEdit(
                                  account,
                                )
                              }
                            >
                              <Pencil className="size-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Excluir ${account.name}`}
                              onClick={() =>
                                setDeleting(
                                  account,
                                )
                              }
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="text-xs text-muted-foreground">
                        Saldo atual
                      </p>

                      <p
                        className={`mt-1 text-2xl font-bold ${
                          balance >= 0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {formatBRL(
                          balance,
                        )}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4">
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          Saldo inicial
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatBRL(
                            account.initial_balance,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          Movimentações
                        </p>

                        <p
                          className={`mt-1 text-sm font-medium ${
                            account.transactionBalance >=
                            0
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {account.transactionBalance >=
                          0
                            ? "+"
                            : "−"}

                          {formatBRL(
                            Math.abs(
                              account.transactionBalance,
                            ),
                          )}
                        </p>
                      </div>
                    </div>

                    {Number(
                      account.balance_adjustment,
                    ) !== 0 ? (
                      <div className="mt-3 rounded-lg bg-secondary/60 px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground">
                            Ajuste automático
                          </span>

                          <span className="text-xs font-medium">
                            {Number(
                              account.balance_adjustment,
                            ) >= 0
                              ? "+"
                              : "−"}

                            {formatBRL(
                              Math.abs(
                                Number(
                                  account.balance_adjustment,
                                ),
                              ),
                            )}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {/* =====================================================
          DIALOG — NOVA / EDITAR CONTA
          ===================================================== */}

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (value) {
            setOpen(true);
          } else {
            closeDialog();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? "Editar conta"
                : "Adicionar conta"}
            </DialogTitle>

            <DialogDescription>
              {editing
                ? "Atualize os dados da conta ou informe o saldo real atual."
                : "Cadastre uma conta para acompanhar seu saldo e vincular movimentações."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* NOME */}

            <div className="space-y-1.5">
              <Label htmlFor="account-name">
                Nome
              </Label>

              <Input
                id="account-name"
                className="h-11"
                placeholder="Nubank, Carteira, Banco..."
                value={
                  form.name
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      name:
                        event.target
                          .value,
                    }),
                  )
                }
              />
            </div>

            {/* TIPO */}

            <div className="space-y-1.5">
              <Label>
                Tipo
              </Label>

              <Select
                value={
                  form.type ||
                  "conta"
                }
                onValueChange={(
                  type,
                ) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      type,
                    }),
                  )
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Escolha o tipo" />
                </SelectTrigger>

                <SelectContent>
                  {ACCOUNT_TYPES.map(
                    ({
                      value,
                      label,
                    }) => (
                      <SelectItem
                        key={value}
                        value={value}
                      >
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* SALDO INICIAL */}

            <div className="space-y-1.5">
              <Label htmlFor="initial-balance">
                Saldo inicial
              </Label>

              <Input
                id="initial-balance"
                className="h-11"
                inputMode="decimal"
                placeholder="0,00"
                value={
                  form.initial_balance
                }
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      initial_balance:
                        event.target
                          .value,
                    }),
                  )
                }
              />

              <p className="text-xs text-muted-foreground">
                O valor que existia nesta conta antes das movimentações cadastradas.
              </p>
            </div>

            {/* SALDO REAL */}

            {editing ? (
              <div className="space-y-1.5">
                <Label htmlFor="real-balance">
                  Saldo real atual
                </Label>

                <Input
                  id="real-balance"
                  className="h-11"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={
                    form.real_balance
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        previous,
                      ) => ({
                        ...previous,
                        real_balance:
                          event.target
                            .value,
                      }),
                    )
                  }
                />

                <p className="text-xs text-muted-foreground">
                  Informe o valor que realmente existe na conta. O ajuste será calculado automaticamente sem alterar suas movimentações.
                </p>
              </div>
            ) : null}

            {/* AJUSTE MANUAL */}

            {!editing ? (
              <div className="space-y-1.5">
                <Label htmlFor="balance-adjustment">
                  Ajuste de saldo
                </Label>

                <Input
                  id="balance-adjustment"
                  className="h-11"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={
                    form.balance_adjustment
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        previous,
                      ) => ({
                        ...previous,
                        balance_adjustment:
                          event.target
                            .value,
                      }),
                    )
                  }
                />

                <p className="text-xs text-muted-foreground">
                  Opcional. Use apenas se quiser começar com uma correção adicional.
                </p>
              </div>
            ) : null}

            {/* PREVISÃO */}

            <div className="rounded-xl border bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">
                O saldo atual é calculado automaticamente:
              </p>

              <p className="mt-1 text-sm font-medium">
                Saldo inicial + movimentações + ajuste
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              onClick={() =>
                void submit()
              }
              disabled={
                save.isPending
              }
            >
              {save.isPending
                ? "Salvando..."
                : editing
                  ? "Salvar alterações"
                  : "Adicionar conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =====================================================
          CONFIRMAÇÃO DE EXCLUSÃO
          ===================================================== */}

      <AlertDialog
        open={Boolean(
          deleting,
        )}
        onOpenChange={(value) => {
          if (!value) {
            setDeleting(
              null,
            );
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir conta?
            </AlertDialogTitle>

            <AlertDialogDescription>
              {deleting
                ? `"${deleting.name}" será excluída. As movimentações vinculadas serão mantidas, mas ficarão sem conta.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() =>
                void confirmDelete()
              }
              disabled={
                remove.isPending
              }
            >
              {remove.isPending
                ? "Excluindo..."
                : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}