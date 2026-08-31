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
  type Account,
  type AccountInput,
  type AccountWithBalance,
} from "@/lib/data";

import {
  formatBRL,
  parseAmount,
} from "@/lib/finance";


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

type AccountFormState = {
  name: string;
  type: string;
};

type BalanceFormState = {
  balance: string;
};


/* =========================================================
   FORMULÁRIOS VAZIOS
   ========================================================= */

const emptyAccountForm =
  (): AccountFormState => ({
    name: "",
    type: "conta",
  });

const emptyBalanceForm =
  (): BalanceFormState => ({
    balance: "",
  });


/* =========================================================
   TIPOS DE CONTA
   ========================================================= */

const ACCOUNT_TYPES = [
  {
    value: "conta",
    label:
      "Conta bancária",
    icon:
      Landmark,
  },

  {
    value: "carteira",
    label:
      "Carteira",
    icon:
      Wallet,
  },

  {
    value: "cartao",
    label:
      "Cartão",
    icon:
      CreditCard,
  },

  {
    value: "dinheiro",
    label:
      "Dinheiro",
    icon:
      Banknote,
  },
] as const;


function getAccountTypeLabel(
  type: string,
) {
  return (
    ACCOUNT_TYPES.find(
      (
        item,
      ) =>
        item.value ===
        type,
    )?.label ??
    type
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


  /* =====================================================
     STATES
     ===================================================== */

  const [
    accountDialogOpen,
    setAccountDialogOpen,
  ] =
    useState(
      false,
    );

  const [
    balanceDialogOpen,
    setBalanceDialogOpen,
  ] =
    useState(
      false,
    );


  const [
    editing,
    setEditing,
  ] =
    useState<
      Account | null
    >(
      null,
    );


  const [
    editingBalance,
    setEditingBalance,
  ] =
    useState<
      AccountWithBalance | null
    >(
      null,
    );


  const [
    deleting,
    setDeleting,
  ] =
    useState<
      Account | null
    >(
      null,
    );


  const [
    accountForm,
    setAccountForm,
  ] =
    useState<
      AccountFormState
    >(
      emptyAccountForm(),
    );


  const [
    balanceForm,
    setBalanceForm,
  ] =
    useState<
      BalanceFormState
    >(
      emptyBalanceForm(),
    );


  /* =====================================================
     TOTAL
     ===================================================== */

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

  function openNewAccount() {
    setEditing(
      null,
    );

    setAccountForm(
      emptyAccountForm(),
    );

    setAccountDialogOpen(
      true,
    );
  }


  /* =====================================================
     EDITAR CONTA
     ===================================================== */

  function openEditAccount(
    account: Account,
  ) {
    setEditing(
      account,
    );

    setAccountForm({
      name:
        account.name,

      type:
        account.type ||
        "conta",
    });

    setAccountDialogOpen(
      true,
    );
  }


  /* =====================================================
     FECHAR DIALOG CONTA
     ===================================================== */

  function closeAccountDialog() {
    setAccountDialogOpen(
      false,
    );

    setEditing(
      null,
    );

    setAccountForm(
      emptyAccountForm(),
    );
  }


  /* =====================================================
     EDITAR SALDO
     ===================================================== */

  function openEditBalance(
    account:
      AccountWithBalance,
  ) {
    setEditingBalance(
      account,
    );

    setBalanceForm({
      balance:
        String(
          account.calculatedBalance,
        ).replace(
          ".",
          ",",
        ),
    });

    setBalanceDialogOpen(
      true,
    );
  }


  function closeBalanceDialog() {
    setBalanceDialogOpen(
      false,
    );

    setEditingBalance(
      null,
    );

    setBalanceForm(
      emptyBalanceForm(),
    );
  }


  /* =====================================================
     SALVAR CONTA
     ===================================================== */

  async function submitAccount() {
    const name =
      accountForm.name.trim();

    if (
      !name
    ) {
      toast.error(
        "Informe o nome da conta.",
      );

      return;
    }


    const values:
      AccountInput = {
        name:
          name.slice(
            0,
            100,
          ),

        type:
          accountForm.type ||
          "conta",
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


      closeAccountDialog();
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


  /* =====================================================
     SALVAR SALDO
     ===================================================== */

  async function submitBalance() {
    if (
      !editingBalance
    ) {
      return;
    }


    const newBalance =
      parseAmount(
        balanceForm.balance,
      );


    if (
      !Number.isFinite(
        newBalance,
      )
    ) {
      toast.error(
        "Informe um saldo válido.",
      );

      return;
    }


    /*
     * Fórmula atual:
     *
     * saldo atual =
     * saldo inicial
     * +
     * ajuste
     * +
     * movimentações
     *
     * Queremos que:
     *
     * novo saldo atual =
     * saldo inicial
     * +
     * novo ajuste
     * +
     * movimentações
     *
     * Portanto:
     *
     * novo ajuste =
     * novo saldo desejado
     * -
     * saldo inicial
     * -
     * movimentações
     */

    const initialBalance =
      Number(
        editingBalance.initial_balance,
      );

    const transactionBalance =
      Number(
        editingBalance.transactionBalance,
      );


    const safeInitialBalance =
      Number.isFinite(
        initialBalance,
      )
        ? initialBalance
        : 0;


    const safeTransactionBalance =
      Number.isFinite(
        transactionBalance,
      )
        ? transactionBalance
        : 0;


    const newAdjustment =
      newBalance -
      safeInitialBalance -
      safeTransactionBalance;


    const values:
      AccountInput = {
        name:
          editingBalance.name,

        type:
          editingBalance.type ||
          "conta",

        initial_balance:
          safeInitialBalance,

        balance_adjustment:
          newAdjustment,
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


  /* =====================================================
     EXCLUIR
     ===================================================== */

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


    setDeleting(
      null,
    );
  }


  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <div className="space-y-6">

      {/* =================================================
         HEADER
         ================================================= */}

      <PageHeader
        title="Contas"
        subtitle="Gerencie suas contas e acompanhe seus saldos."
        action={
          <Button
            className="h-11"
            onClick={
              openNewAccount
            }
          >
            <Plus className="size-4" />

            Adicionar conta
          </Button>
        }
      />


      {/* =================================================
         RESUMO
         ================================================= */}

      <div className="surface p-5">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-sm text-muted-foreground">
              Saldo total
            </p>


            <p
              className={`mt-1 text-3xl font-bold tracking-tight ${
                totalBalance >=
                0
                  ? "text-success"
                  : "text-destructive"
              }`}
            >
              {
                formatBRL(
                  totalBalance,
                )
              }
            </p>

          </div>


          <p className="text-xs text-muted-foreground">
            {
              accounts.length ===
              1
                ? "1 conta cadastrada"
                : `${accounts.length} contas cadastradas`
            }
          </p>

        </div>

      </div>


      {/* =================================================
         LOADING
         ================================================= */}

      {
        isLoading ? (
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
            description="Cadastre uma conta para acompanhar seus saldos e movimentações."
            action={
              <Button
                onClick={
                  openNewAccount
                }
              >
                <Plus className="size-4" />

                Adicionar conta
              </Button>
            }
          />
        ) : (

          /* =============================================
             LISTA
             ============================================= */

          <div className="grid gap-4 md:grid-cols-2">

            {
              accounts.map(
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

                        {/* =================================
                           TOPO
                           ================================= */}

                        <div className="flex items-start gap-3">

                          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                            <Icon className="size-5" />
                          </span>


                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">

                                <p className="truncate font-semibold">
                                  {
                                    account.name
                                  }
                                </p>


                                <p className="text-xs text-muted-foreground">
                                  {
                                    getAccountTypeLabel(
                                      account.type,
                                    )
                                  }
                                </p>

                              </div>


                              <div className="flex shrink-0 gap-1">

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Editar ${account.name}`}
                                  onClick={() =>
                                    openEditAccount(
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


                        {/* =================================
                           SALDO
                           ================================= */}

                        <div className="mt-6">

                          <div className="flex items-center justify-between gap-4">

                            <p className="text-xs text-muted-foreground">
                              Saldo atual
                            </p>


                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openEditBalance(
                                  account,
                                )
                              }
                            >
                              <Pencil className="size-3.5" />

                              Editar saldo
                            </Button>

                          </div>


                          <p
                            className={`mt-2 text-3xl font-bold tracking-tight ${
                              balance >=
                              0
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {
                              formatBRL(
                                balance,
                              )
                            }
                          </p>

                        </div>


                        {/* =================================
                           MOVIMENTAÇÕES
                           ================================= */}

                        <div className="mt-6 border-t pt-4">

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
                            {
                              account.transactionBalance >=
                              0
                                ? "+"
                                : "−"
                            }

                            {
                              formatBRL(
                                Math.abs(
                                  account.transactionBalance,
                                ),
                              )
                            }
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                },
              )
            }

          </div>
        )
      }


      {/* =================================================
         DIALOG
         CRIAR / EDITAR CONTA
         ================================================= */}

      <Dialog
        open={
          accountDialogOpen
        }
        onOpenChange={(
          value,
        ) => {
          if (
            value
          ) {
            setAccountDialogOpen(
              true,
            );
          } else {
            closeAccountDialog();
          }
        }}
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              {
                editing
                  ? "Editar conta"
                  : "Adicionar conta"
              }
            </DialogTitle>


            <DialogDescription>
              {
                editing
                  ? "Atualize os dados da sua conta."
                  : "Cadastre uma nova conta."
              }
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
                placeholder="Nubank, Carteira, Banco..."
                value={
                  accountForm.name
                }
                onChange={(
                  event,
                ) =>
                  setAccountForm(
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
                  accountForm.type ||
                  "conta"
                }
                onValueChange={(
                  type,
                ) =>
                  setAccountForm(
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

                  {
                    ACCOUNT_TYPES.map(
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
                          {
                            label
                          }
                        </SelectItem>
                      ),
                    )
                  }

                </SelectContent>

              </Select>

            </div>

          </div>


          <DialogFooter>

            <Button
              className="h-11 w-full"
              onClick={() =>
                void submitAccount()
              }
              disabled={
                save.isPending
              }
            >
              {
                save.isPending
                  ? "Salvando..."
                  : editing
                    ? "Salvar alterações"
                    : "Adicionar conta"
              }
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* =================================================
         DIALOG
         EDITAR SALDO
         ================================================= */}

      <Dialog
        open={
          balanceDialogOpen
        }
        onOpenChange={(
          value,
        ) => {
          if (
            value
          ) {
            setBalanceDialogOpen(
              true,
            );
          } else {
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
              {
                editingBalance
                  ? `Informe o saldo atual de "${editingBalance.name}".`
                  : "Informe o novo saldo atual da conta."
              }
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-2">

            <Label htmlFor="current-balance">
              Saldo atual
            </Label>


            <Input
              id="current-balance"
              className="h-12 text-lg font-semibold"
              inputMode="decimal"
              placeholder="0,00"
              value={
                balanceForm.balance
              }
              onChange={(
                event,
              ) =>
                setBalanceForm({
                  balance:
                    event.target.value,
                })
              }
            />


            <p className="text-xs text-muted-foreground">
              As movimentações já cadastradas serão mantidas.
              O sistema ajustará automaticamente o saldo da conta.
            </p>

          </div>


          <DialogFooter>

            <Button
              className="h-11 w-full"
              onClick={() =>
                void submitBalance()
              }
              disabled={
                save.isPending
              }
            >
              {
                save.isPending
                  ? "Salvando..."
                  : "Salvar saldo"
              }
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* =================================================
         CONFIRMAR EXCLUSÃO
         ================================================= */}

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
              {
                deleting
                  ? `"${deleting.name}" será excluída. As movimentações serão mantidas, mas ficarão sem uma conta vinculada.`
                  : ""
              }
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
              {
                remove.isPending
                  ? "Excluindo..."
                  : "Excluir"
              }
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

    </div>
  );
}