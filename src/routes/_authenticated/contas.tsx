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
  Eye,
  EyeOff,
  ArrowRightLeft,
  BadgeDollarSign,
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
  useToggleAccountVisibility,
  type Account,
  type AccountInput,
} from "@/lib/data";

import {
  formatBRL,
  parseAmount,
} from "@/lib/finance";

/* =========================================================
   ROTA
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
        {
          property:
            "og:title",
          content:
            "Contas — FinanLook",
        },
        {
          property:
            "og:description",
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
  initial_balance: string;
  balance_adjustment: string;
};

const emptyForm =
  (): FormState => ({
    name: "",
    type: "conta",
    initial_balance: "",
    balance_adjustment: "",
  });

const ACCOUNT_TYPES = [
  {
    value:
      "saldo_principal",

    label:
      "Saldo principal",

    icon:
      BadgeDollarSign,
  },

  {
    value:
      "conta",

    label:
      "Conta bancária",

    icon:
      Landmark,
  },

  {
    value:
      "carteira",

    label:
      "Carteira",

    icon:
      Wallet,
  },

  {
    value:
      "cartao",

    label:
      "Cartão",

    icon:
      CreditCard,
  },

  {
    value:
      "dinheiro",

    label:
      "Dinheiro",

    icon:
      Banknote,
  },
] as const;

/* =========================================================
   HELPERS
   ========================================================= */

function getAccountTypeLabel(
  type: string,
) {
  return (
    ACCOUNT_TYPES.find(
      (item) =>
        item.value === type,
    )?.label ??
    type
  );
}

function getAccountIcon(
  type: string,
) {
  return (
    ACCOUNT_TYPES.find(
      (item) =>
        item.value === type,
    )?.icon ??
    Landmark
  );
}

/* =========================================================
   PÁGINA
   ========================================================= */

function AccountsPage() {
  const {
    data:
      accounts = [],

    isLoading,

    isError,
  } =
    useAccountsWithBalances();

  const save =
    useSaveAccount();

  const remove =
    useDeleteAccount();

  const toggleVisibility =
    useToggleAccountVisibility();

  /* =====================================================
     ESTADOS
     ===================================================== */

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    editing,
    setEditing,
  ] =
    useState<Account | null>(
      null,
    );

  const [
    deleting,
    setDeleting,
  ] =
    useState<Account | null>(
      null,
    );

  /*
   * Conta que receberá as movimentações
   * quando a conta atual for excluída.
   */
  const [
    transferAccountId,
    setTransferAccountId,
  ] =
    useState(
      "sem-conta",
    );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      emptyForm(),
    );

  /* =====================================================
     CONTAS VISÍVEIS / OCULTAS
     ===================================================== */

  const visibleAccounts =
    accounts.filter(
      (account) =>
        !account.is_hidden,
    );

  const hiddenAccounts =
    accounts.filter(
      (account) =>
        account.is_hidden,
    );

  /*
   * O saldo total considera TODAS as contas,
   * inclusive escondidas.
   */

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

  /* =====================================================
     NOVA CONTA
     ===================================================== */

  function openNew() {
    setEditing(null);

    setForm(
      emptyForm(),
    );

    setOpen(true);
  }

  /* =====================================================
     EDITAR
     ===================================================== */

  function openEdit(
    account: Account,
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

      initial_balance:
        String(
          Number(
            account.initial_balance,
          ),
        ).replace(
          ".",
          ",",
        ),

      balance_adjustment:
        String(
          Number(
            account.balance_adjustment,
          ),
        ).replace(
          ".",
          ",",
        ),
    });

    setOpen(true);
  }

  /* =====================================================
     FECHAR DIALOG
     ===================================================== */

  function closeDialog() {
    setOpen(false);

    setEditing(null);

    setForm(
      emptyForm(),
    );
  }

  /* =====================================================
     SALVAR
     ===================================================== */

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

    const balanceAdjustment =
      parseAmount(
        form.balance_adjustment,
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

    /*
     * Mantemos as propriedades especiais
     * da conta automática quando estamos
     * apenas editando.
     */

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

      is_primary:
        editing?.is_primary ??
        false,

      is_hidden:
        editing?.is_hidden ??
        false,
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
        "Não foi possível salvar a conta. Tente novamente.",
      );
    }
  }

  /* =====================================================
     ESCONDER / MOSTRAR
     ===================================================== */

  async function changeVisibility(
    account: Account,
  ) {
    try {
      await toggleVisibility.mutateAsync({
        id:
          account.id,

        is_hidden:
          !account.is_hidden,
      });

      toast.success(
        account.is_hidden
          ? "Conta exibida novamente."
          : "Conta escondida.",
      );
    } catch (
      error
    ) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível alterar a visibilidade.",
      );
    }
  }

  /* =====================================================
     ABRIR EXCLUSÃO
     ===================================================== */

  function openDelete(
    account: Account,
  ) {
    setDeleting(
      account,
    );

    setTransferAccountId(
      "sem-conta",
    );
  }

  /* =====================================================
     CONFIRMAR EXCLUSÃO
     ===================================================== */

  async function confirmDelete() {
    if (
      !deleting
    ) {
      return;
    }

    try {
      await remove.mutateAsync({
        id:
          deleting.id,

        transfer_to_account_id:
          transferAccountId ===
          "sem-conta"
            ? null
            : transferAccountId,
      });

      toast.success(
        transferAccountId ===
          "sem-conta"
          ? "Conta excluída. As movimentações ficaram sem conta vinculada."
          : "Conta excluída e movimentações transferidas.",
      );

      setDeleting(
        null,
      );

      setTransferAccountId(
        "sem-conta",
      );
    } catch (
      error
    ) {
      console.error(
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a conta.",
      );
    }
  }

  /* =====================================================
     CARD DA CONTA
     ===================================================== */

  function AccountCard({
    account,
  }: {
    account: typeof accounts[number];
  }) {
    const Icon =
      getAccountIcon(
        account.type,
      );

    const balance =
      account.calculatedBalance;

    return (
      <div
        className={`surface overflow-hidden ${
          account.is_hidden
            ? "opacity-70"
            : ""
        }`}
      >
        <div className="p-5">

          {/* =================================================
              CABEÇALHO
             ================================================= */}

          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Icon className="size-5" />
            </span>

            <div className="min-w-0 flex-1">

              <div className="flex items-start justify-between gap-3">

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <p className="truncate font-semibold">
                      {account.name}
                    </p>

                    {account.is_primary ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Principal
                      </span>
                    ) : null}

                    {account.is_hidden ? (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        Oculta
                      </span>
                    ) : null}

                  </div>

                  <p className="text-xs text-muted-foreground">
                    {getAccountTypeLabel(
                      account.type,
                    )}
                  </p>

                </div>

                {/* =============================================
                    AÇÕES
                   ============================================= */}

                <div className="flex shrink-0 gap-1">

                  {/* EDITAR */}

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

                  {/* ESCONDER */}

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={
                      account.is_hidden
                        ? `Mostrar ${account.name}`
                        : `Esconder ${account.name}`
                    }
                    onClick={() =>
                      void changeVisibility(
                        account,
                      )
                    }
                    disabled={
                      toggleVisibility.isPending
                    }
                  >
                    {account.is_hidden ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </Button>

                  {/* EXCLUIR */}

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${account.name}`}
                    onClick={() =>
                      openDelete(
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

          {/* =================================================
              SALDO ATUAL
             ================================================= */}

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

          {/* =================================================
              DETALHES
             ================================================= */}

          <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4">

            <div>

              <p className="text-[11px] text-muted-foreground">
                Saldo inicial
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatBRL(
                  Number(
                    account.initial_balance,
                  ),
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

          {/* =================================================
              AJUSTE MANUAL
             ================================================= */}

          {Number(
            account.balance_adjustment,
          ) !== 0 ? (
            <div className="mt-3 rounded-lg bg-secondary/60 px-3 py-2">

              <div className="flex items-center justify-between gap-3">

                <span className="text-xs text-muted-foreground">
                  Ajuste manual
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
  }

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <div className="space-y-6">

      <PageHeader
        title="Contas"
        subtitle="Gerencie suas contas, saldo principal e movimentações."
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
          CARREGAMENTO
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
          description="Adicione uma conta para acompanhar seus saldos."
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

        <div className="space-y-6">

          {/* =================================================
              CONTAS VISÍVEIS
             ================================================= */}

          {visibleAccounts.length >
          0 ? (

            <div className="grid gap-4 md:grid-cols-2">

              {visibleAccounts.map(
                (
                  account,
                ) => (
                  <AccountCard
                    key={
                      account.id
                    }
                    account={
                      account
                    }
                  />
                ),
              )}

            </div>

          ) : null}

          {/* =================================================
              CONTAS OCULTAS
             ================================================= */}

          {hiddenAccounts.length >
          0 ? (

            <div>

              <div className="mb-3 flex items-center gap-2">

                <EyeOff className="size-4 text-muted-foreground" />

                <p className="text-sm font-semibold">
                  Contas ocultas
                </p>

                <span className="text-xs text-muted-foreground">
                  ({hiddenAccounts.length})
                </span>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                {hiddenAccounts.map(
                  (
                    account,
                  ) => (
                    <AccountCard
                      key={
                        account.id
                      }
                      account={
                        account
                      }
                    />
                  ),
                )}

              </div>

            </div>

          ) : null}

        </div>

      )}

      {/* =====================================================
          DIALOG — NOVA / EDITAR
         ===================================================== */}

      <Dialog
        open={
          open
        }
        onOpenChange={(
          value,
        ) => {
          if (value) {
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

              {editing
                ? "Atualize os dados e o saldo real da sua conta."
                : "Cadastre uma conta para acompanhar seus saldos e movimentações."}

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
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
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
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      initial_balance:
                        event.target
                          .value,
                    }),
                  )
                }
              />

              <p className="text-xs text-muted-foreground">
                O saldo base da conta antes das movimentações cadastradas.
              </p>

            </div>

            {/* AJUSTE MANUAL */}

            <div className="space-y-1.5">

              <Label htmlFor="balance-adjustment">
                Ajuste do saldo real
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
                Use este campo para corrigir o saldo real sem apagar suas movimentações.
              </p>

            </div>

            {/* EXPLICAÇÃO */}

            <div className="rounded-xl border bg-secondary/50 p-3">

              <p className="text-xs text-muted-foreground">
                Saldo calculado automaticamente:
              </p>

              <p className="mt-1 text-sm font-medium">
                Saldo inicial + ajuste + movimentações
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
          EXCLUIR CONTA
         ===================================================== */}

      <AlertDialog
        open={
          Boolean(
            deleting,
          )
        }
        onOpenChange={(
          value,
        ) => {
          if (!value) {
            setDeleting(
              null,
            );

            setTransferAccountId(
              "sem-conta",
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
                ? `"${deleting.name}" será excluída. Você pode transferir as movimentações para outra conta ou deixá-las sem conta vinculada.`
                : ""}

            </AlertDialogDescription>

          </AlertDialogHeader>

          {/* =================================================
              TRANSFERÊNCIA
             ================================================= */}

          {deleting ? (

            <div className="space-y-2">

              <Label>
                Movimentações da conta
              </Label>

              <div className="flex items-center gap-2 rounded-lg border p-3">

                <ArrowRightLeft className="size-4 shrink-0 text-muted-foreground" />

                <Select
                  value={
                    transferAccountId
                  }
                  onValueChange={
                    setTransferAccountId
                  }
                >

                  <SelectTrigger>

                    <SelectValue placeholder="Escolha o destino" />

                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="sem-conta">
                      Deixar sem conta
                    </SelectItem>

                    {accounts
                      .filter(
                        (
                          account,
                        ) =>
                          account.id !==
                          deleting.id,
                      )
                      .map(
                        (
                          account,
                        ) => (

                          <SelectItem
                            key={
                              account.id
                            }
                            value={
                              account.id
                            }
                          >
                            {account.name}
                          </SelectItem>

                        ),
                      )}

                  </SelectContent>

                </Select>

              </div>

            </div>

          ) : null}

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
                : "Excluir conta"}

            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

    </div>
  );
}