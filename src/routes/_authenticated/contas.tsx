import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  useState,
} from "react";

import {
  toast,
} from "sonner";

import {
  Landmark,
  Pencil,
  Plus,
  Trash2,
  Wallet,
  CreditCard,
  Banknote,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

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

import {
  EmptyState,
} from "@/components/EmptyState";

import {
  PageHeader,
} from "@/components/PageHeader";

import {
  useAccountsWithBalances,
  useDeleteAccount,
  useSaveAccount,
  type AccountWithBalance,
  type AccountInput,
} from "@/lib/data";

import {
  formatBRL,
  parseAmount,
} from "@/lib/finance";

/* =========================================================
   ROUTE
   ========================================================= */

export const Route =
  createFileRoute(
    "/_authenticated/contas",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Contas — FinanLook",
        },
        {
          name:
            "description",
          content:
            "Gerencie suas contas e acompanhe seus saldos no FinanLook.",
        },
      ],
    }),

    component:
      AccountsPage,
  });

/* =========================================================
   TIPOS
   ========================================================= */

type FormState = {
  name: string;
  type: string;
  current_balance: string;
};

const emptyForm =
  (): FormState => ({
    name: "",
    type: "conta",
    current_balance: "0",
  });

/* =========================================================
   TIPOS DE CONTA
   ========================================================= */

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
] as const;

function getAccountTypeLabel(
  type: string,
) {
  return (
    ACCOUNT_TYPES.find(
      (item) =>
        item.value === type,
    )?.label ?? type
  );
}

/* =========================================================
   PÁGINA
   ========================================================= */

function AccountsPage() {
  const {
    data: accounts = [],
    isLoading,
    isError,
  } =
    useAccountsWithBalances();

  const save =
    useSaveAccount();

  const remove =
    useDeleteAccount();

  /*
   * Dialog completo da conta.
   */

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    editing,
    setEditing,
  ] =
    useState<
      AccountWithBalance | null
    >(null);

  /*
   * Dialog exclusivo para saldo.
   */

  const [
    editingBalance,
    setEditingBalance,
  ] =
    useState<
      AccountWithBalance | null
    >(null);

  const [
    balanceValue,
    setBalanceValue,
  ] =
    useState("");

  /*
   * Exclusão.
   */

  const [
    deleting,
    setDeleting,
  ] =
    useState<
      AccountWithBalance | null
    >(null);

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      emptyForm(),
    );

  /* =======================================================
     SALDO TOTAL
     ======================================================= */

  const totalBalance =
    accounts.reduce(
      (
        total,
        account,
      ) =>
        total +
        account.calculatedBalance,
      0,
    );

  /* =======================================================
     NOVA CONTA
     ======================================================= */

  function openNew() {
    setEditing(null);

    setForm(
      emptyForm(),
    );

    setOpen(true);
  }

  /* =======================================================
     EDITAR CONTA COMPLETA
     ======================================================= */

  function openEdit(
    account:
      AccountWithBalance,
  ) {
    setEditing(
      account,
    );

    setForm({
      name:
        account.name,

      type:
        account.type ||
        "conta",

      current_balance:
        String(
          Number(
            account.calculatedBalance,
          ),
        ).replace(
          ".",
          ",",
        ),
    });

    setOpen(true);
  }

  /* =======================================================
     EDITAR APENAS SALDO
     ======================================================= */

  function openEditBalance(
    account:
      AccountWithBalance,
  ) {
    setEditingBalance(
      account,
    );

    setBalanceValue(
      String(
        Number(
          account.calculatedBalance,
        ),
      ).replace(
        ".",
        ",",
      ),
    );
  }

  /* =======================================================
     FECHAR DIALOG COMPLETO
     ======================================================= */

  function closeDialog() {
    setOpen(false);

    setEditing(null);

    setForm(
      emptyForm(),
    );
  }

  /* =======================================================
     FECHAR DIALOG SALDO
     ======================================================= */

  function closeBalanceDialog() {
    setEditingBalance(
      null,
    );

    setBalanceValue(
      "",
    );
  }

  /* =======================================================
     CALCULAR AJUSTE
     ======================================================= */

  function calculateAdjustment(
    currentBalance: number,
    account:
      | AccountWithBalance
      | null,
  ) {
    const transactionBalance =
      Number(
        account?.transactionBalance,
      ) || 0;

    const initialBalance =
      Number(
        account?.initial_balance,
      ) || 0;

    return (
      currentBalance -
      initialBalance -
      transactionBalance
    );
  }

  /* =======================================================
     SALVAR CONTA COMPLETA
     ======================================================= */

  async function submit() {
    const name =
      form.name.trim();

    if (!name) {
      toast.error(
        "Informe o nome da conta.",
      );

      return;
    }

    const currentBalance =
      parseAmount(
        form.current_balance,
      );

    if (
      !Number.isFinite(
        currentBalance,
      )
    ) {
      toast.error(
        "Informe um saldo válido.",
      );

      return;
    }

    /*
     * O saldo digitado pelo usuário
     * será o saldo final da conta.
     */

    const balanceAdjustment =
      calculateAdjustment(
        currentBalance,
        editing,
      );

    const values:
      AccountInput = {
      name:
        name.slice(
          0,
          100,
        ),

      type:
        form.type ||
        "conta",

      initial_balance:
        Number(
          editing?.initial_balance,
        ) || 0,

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
    } catch (
      error
    ) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível salvar a conta.",
      );
    }
  }

  /* =======================================================
     SALVAR APENAS SALDO
     ======================================================= */

  async function saveBalance() {
    if (
      !editingBalance
    ) {
      return;
    }

    const currentBalance =
      parseAmount(
        balanceValue,
      );

    if (
      !Number.isFinite(
        currentBalance,
      )
    ) {
      toast.error(
        "Informe um saldo válido.",
      );

      return;
    }

    const balanceAdjustment =
      calculateAdjustment(
        currentBalance,
        editingBalance,
      );

    const values:
      AccountInput = {
      name:
        editingBalance.name,

      type:
        editingBalance.type ||
        "conta",

      initial_balance:
        Number(
          editingBalance.initial_balance,
        ) || 0,

      balance_adjustment:
        balanceAdjustment,
    };

    try {
      await save.mutateAsync({
        id:
          editingBalance.id,

        values,
      });

      toast.success(
        "Saldo atualizado.",
      );

      closeBalanceDialog();
    } catch (
      error
    ) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível atualizar o saldo.",
      );
    }
  }

  /* =======================================================
     EXCLUIR CONTA
     ======================================================= */

  async function confirmDelete() {
    if (
      !deleting
    ) {
      return;
    }

    try {
      await remove.mutateAsync(
        deleting.id,
      );

      toast.success(
        "Conta excluída.",
      );
    } catch (
      error
    ) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível excluir a conta.",
      );
    }

    setDeleting(null);
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="space-y-6">

      {/* CABEÇALHO */}

      <PageHeader
        title="Contas"
        subtitle="Gerencie suas contas e acompanhe seus saldos."
        action={
          <Button
            className="h-11"
            onClick={
              openNew
            }
          >
            <Plus className="size-4" />

            Adicionar conta
          </Button>
        }
      />

      {/* RESUMO */}

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

      {/* ESTADOS */}

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

      ) : accounts.length === 0 ? (

        <EmptyState
          emoji="🏦"
          title="Você ainda não possui contas."
          description="Cadastre uma conta para acompanhar seus saldos."
          action={
            <Button
              onClick={
                openNew
              }
            >
              <Plus className="size-4" />

              Adicionar conta
            </Button>
          }
        />

      ) : (

        <div className="grid gap-4 md:grid-cols-2">

          {accounts.map(
            (
              account,
            ) => {

              const Icon =
                ACCOUNT_TYPES.find(
                  (
                    item,
                  ) =>
                    item.value ===
                    account.type,
                )?.icon ??
                Landmark;

              const balance =
                account.calculatedBalance;

              return (
                <div
                  key={
                    account.id
                  }
                  className="surface overflow-hidden"
                >

                  <div className="p-5">

                    {/* TOPO */}

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
                              {getAccountTypeLabel(
                                account.type,
                              )}
                            </p>

                          </div>

                          {/* UM ÚNICO LÁPIS PARA EDITAR CONTA */}

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

                    {/* SALDO ATUAL */}

                    <div className="mt-6">

                      <div className="flex items-center justify-between gap-3">

                        <div>

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

                        {/* LÁPIS EXCLUSIVO DO SALDO */}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          aria-label={`Editar saldo de ${account.name}`}
                          onClick={() =>
                            openEditBalance(
                              account,
                            )
                          }
                        >
                          <Pencil className="size-4" />
                        </Button>

                      </div>

                    </div>

                  </div>

                </div>
              );
            },
          )}

        </div>

      )}

      {/* ===================================================
          DIALOG EDITAR CONTA
          =================================================== */}

      <Dialog
        open={
          open
        }
        onOpenChange={(
          value,
        ) => {
          if (
            value
          ) {
            setOpen(
              true,
            );
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
              Atualize os dados da sua conta.
            </DialogDescription>

          </DialogHeader>

          <div className="space-y-4">

            <div className="space-y-1.5">

              <Label htmlFor="account-name">
                Nome
              </Label>

              <Input
                id="account-name"
                className="h-11"
                value={
                  form.name
                }
                placeholder="Nome da conta"
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      name:
                        event.target.value,
                    }),
                  )
                }
              />

            </div>

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
                    (
                      previous,
                    ) => ({
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
                        key={
                          value
                        }
                        value={
                          value
                        }
                      >
                        {label}
                      </SelectItem>

                    ),
                  )}

                </SelectContent>

              </Select>

            </div>

            <div className="space-y-1.5">

              <Label htmlFor="current-balance">
                Saldo atual
              </Label>

              <Input
                id="current-balance"
                className="h-11"
                inputMode="decimal"
                placeholder="0,00"
                value={
                  form.current_balance
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      current_balance:
                        event.target.value,
                    }),
                  )
                }
              />

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

      {/* ===================================================
          DIALOG EDITAR SALDO
          =================================================== */}

      <Dialog
        open={
          Boolean(
            editingBalance,
          )
        }
        onOpenChange={(
          value,
        ) => {
          if (
            !value
          ) {
            closeBalanceDialog();
          }
        }}
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              Editar saldo
            </DialogTitle>

            <DialogDescription>
              {editingBalance
                ? `Atualize o saldo atual de "${editingBalance.name}".`
                : ""}
            </DialogDescription>

          </DialogHeader>

          <div className="space-y-2">

            <Label htmlFor="balance-value">
              Saldo atual
            </Label>

            <Input
              id="balance-value"
              className="h-11"
              inputMode="decimal"
              placeholder="0,00"
              value={
                balanceValue
              }
              onChange={(
                event,
              ) =>
                setBalanceValue(
                  event.target.value,
                )
              }
            />

          </div>

          <DialogFooter>

            <Button
              className="h-11 w-full"
              onClick={() =>
                void saveBalance()
              }
              disabled={
                save.isPending
              }
            >
              {save.isPending
                ? "Salvando..."
                : "Salvar saldo"}
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

      {/* ===================================================
          CONFIRMAR EXCLUSÃO
          =================================================== */}

      <AlertDialog
        open={
          Boolean(
            deleting,
          )
        }
        onOpenChange={(
          value,
        ) => {
          if (
            !value
          ) {
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