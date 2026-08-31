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
};


const emptyForm =
  (): FormState => ({
    name: "",
    type: "conta",
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


/* =========================================================
   LABEL DO TIPO
   ========================================================= */

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
     DIALOG EDITAR CONTA
     ===================================================== */

  const [
    open,
    setOpen,
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


  /* =====================================================
     EXCLUIR
     ===================================================== */

  const [
    deleting,
    setDeleting,
  ] =
    useState<
      Account | null
    >(
      null,
    );


  /* =====================================================
     FORM
     ===================================================== */

  const [
    form,
    setForm,
  ] =
    useState<
      FormState
    >(
      emptyForm(),
    );


  /* =====================================================
     EDITAR SALDO ATUAL
     ===================================================== */

  const [
    balanceOpen,
    setBalanceOpen,
  ] =
    useState(
      false,
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
    balanceValue,
    setBalanceValue,
  ] =
    useState(
      "",
    );


  /* =====================================================
     SALDO TOTAL
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

  function openNew() {
    setEditing(
      null,
    );

    setForm(
      emptyForm(),
    );

    setOpen(
      true,
    );
  }


  /* =====================================================
     EDITAR CONTA
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
    });

    setOpen(
      true,
    );
  }


  /* =====================================================
     FECHAR DIALOG CONTA
     ===================================================== */

  function closeDialog() {
    setOpen(
      false,
    );

    setEditing(
      null,
    );

    setForm(
      emptyForm(),
    );
  }


  /* =====================================================
     SALVAR CONTA
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


    /*
     * Para não alterar o saldo ao
     * editar nome ou tipo da conta,
     * mantemos os valores existentes.
     */

    const currentInitialBalance =
      editing
        ? Number(
            editing.initial_balance,
          )
        : 0;


    const currentBalanceAdjustment =
      editing
        ? Number(
            editing.balance_adjustment,
          )
        : 0;


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
        Number.isFinite(
          currentInitialBalance,
        )
          ? currentInitialBalance
          : 0,

      balance_adjustment:
        Number.isFinite(
          currentBalanceAdjustment,
        )
          ? currentBalanceAdjustment
          : 0,
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


  /* =====================================================
     ABRIR EDITAR SALDO
     ===================================================== */

  function openEditBalance(
    account: AccountWithBalance,
  ) {
    setEditingBalance(
      account,
    );


    /*
     * Mostra o saldo atual no input.
     */

    setBalanceValue(
      String(
        account.calculatedBalance,
      ).replace(
        ".",
        ",",
      ),
    );


    setBalanceOpen(
      true,
    );
  }


  /* =====================================================
     FECHAR EDITAR SALDO
     ===================================================== */

  function closeBalanceDialog() {
    setBalanceOpen(
      false,
    );

    setEditingBalance(
      null,
    );

    setBalanceValue(
      "",
    );
  }


  /* =====================================================
     SALVAR SALDO ATUAL
     ===================================================== */

  async function saveCurrentBalance() {
    if (
      !editingBalance
    ) {
      return;
    }


    const newBalance =
      parseAmount(
        balanceValue,
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
     * Pegamos os valores atuais.
     */

    const initialBalance =
      Number(
        editingBalance.initial_balance,
      );


    const safeInitialBalance =
      Number.isFinite(
        initialBalance,
      )
        ? initialBalance
        : 0;


    /*
     * Fórmula atual:
     *
     * saldo atual =
     *
     * saldo inicial
     * +
     * ajuste
     * +
     * movimentações
     *
     * Então:
     *
     * ajuste =
     *
     * novo saldo
     * -
     * saldo inicial
     * -
     * movimentações
     */

    const newAdjustment =
      newBalance -
      safeInitialBalance -
      editingBalance.transactionBalance;


    try {
      await save.mutateAsync({
        id:
          editingBalance.id,

        values: {
          name:
            editingBalance.name,

          type:
            editingBalance.type,

          initial_balance:
            safeInitialBalance,

          balance_adjustment:
            newAdjustment,
        },
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
     EXCLUIR CONTA
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
              openNew
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
              {formatBRL(
                totalBalance,
              )}
            </p>

          </div>


          <p className="text-xs text-muted-foreground">

            {accounts.length ===
            1
              ? "1 conta cadastrada"
              : `${accounts.length} contas cadastradas`}

          </p>

        </div>

      </div>


      {/* =================================================
          CARREGANDO
          ================================================= */}

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

        /* =============================================
           LISTA DE CONTAS
           ============================================= */

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


                    {/* =================================
                        CABEÇALHO
                        ================================= */}

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


                          {/* ===========================
                              APENAS UM LÁPIS
                              PARA EDITAR A CONTA
                              =========================== */}

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


                    {/* =================================
                        SALDO ATUAL
                        ================================= */}

                    <div className="mt-6">

                      <div className="flex items-center gap-1">

                        <p className="text-xs text-muted-foreground">
                          Saldo atual
                        </p>


                        {/* ===========================
                            SEGUNDO LÁPIS
                            APENAS PARA O SALDO
                            =========================== */}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          aria-label={`Editar saldo de ${account.name}`}
                          onClick={() =>
                            openEditBalance(
                              account,
                            )
                          }
                        >
                          <Pencil className="size-3.5" />
                        </Button>

                      </div>


                      <p
                        className={`mt-1 text-2xl font-bold ${
                          balance >=
                          0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {formatBRL(
                          balance,
                        )}
                      </p>

                    </div>

                  </div>

                </div>
              );
            },
          )}

        </div>
      )}


      {/* =================================================
          DIALOG
          ADICIONAR / EDITAR CONTA
          ================================================= */}

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

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>

              {editing
                ? "Editar conta"
                : "Adicionar conta"}

            </DialogTitle>


            <DialogDescription>

              {editing
                ? "Atualize o nome e o tipo da conta."
                : "Cadastre uma nova conta para acompanhar seu saldo."}

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


      {/* =================================================
          DIALOG EDITAR SALDO ATUAL
          ================================================= */}

      <Dialog
        open={
          balanceOpen
        }
        onOpenChange={(
          value,
        ) => {
          if (
            value
          ) {
            setBalanceOpen(
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
              Editar saldo atual
            </DialogTitle>


            <DialogDescription>

              {editingBalance
                ? `Defina o saldo atual de "${editingBalance.name}".`
                : "Defina o novo saldo da conta."}

            </DialogDescription>

          </DialogHeader>


          <div className="space-y-2">

            <Label htmlFor="current-balance">
              Saldo atual
            </Label>


            <Input
              id="current-balance"
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
                  event.target
                    .value,
                )
              }
            />


            <p className="text-xs text-muted-foreground">
              As movimentações serão mantidas.
              O saldo da conta será ajustado
              automaticamente para ficar igual
              ao valor informado.
            </p>

          </div>


          <DialogFooter>

            <Button
              variant="outline"
              onClick={
                closeBalanceDialog
              }
              disabled={
                save.isPending
              }
            >
              Cancelar
            </Button>


            <Button
              onClick={() =>
                void saveCurrentBalance()
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

              {deleting
                ? `"${deleting.name}" será excluída. As movimentações vinculadas serão mantidas, mas ficarão sem conta vinculada.`
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