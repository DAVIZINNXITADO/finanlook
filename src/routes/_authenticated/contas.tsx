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
            "Gerencie suas contas e acompanhe seus saldos.",
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

type TotalFormState = {
  total_balance: string;
};


/* =========================================================
   FORMULÁRIOS VAZIOS
   ========================================================= */

const emptyForm =
  (): FormState => ({
    name: "",
    type: "conta",
    current_balance: "",
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


/* =========================================================
   LABEL DO TIPO
   ========================================================= */

function getAccountTypeLabel(
  type: string,
) {
  return (
    ACCOUNT_TYPES.find(
      (item) =>
        item.value === type,
    )?.label ??
    "Conta bancária"
  );
}


/* =========================================================
   FORMATAR VALOR PARA INPUT
   ========================================================= */

function formatValueForInput(
  value: number,
) {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return "0,00";
  }

  return value
    .toFixed(2)
    .replace(
      ".",
      ",",
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


  /* =======================================================
     DIALOG CONTA
     ======================================================= */

  const [
    accountDialogOpen,
    setAccountDialogOpen,
  ] =
    useState(false);


  const [
    editing,
    setEditing,
  ] =
    useState<AccountWithBalance | null>(
      null,
    );


  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      emptyForm(),
    );


  /* =======================================================
     DIALOG TOTAL
     ======================================================= */

  const [
    totalDialogOpen,
    setTotalDialogOpen,
  ] =
    useState(false);


  const [
    totalForm,
    setTotalForm,
  ] =
    useState<TotalFormState>({
      total_balance: "",
    });


  /* =======================================================
     EXCLUSÃO
     ======================================================= */

  const [
    deleting,
    setDeleting,
  ] =
    useState<AccountWithBalance | null>(
      null,
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
     ABRIR NOVA CONTA
     ======================================================= */

  function openNew() {

    setEditing(
      null,
    );

    setForm(
      emptyForm(),
    );

    setAccountDialogOpen(
      true,
    );
  }


  /* =======================================================
     ABRIR EDIÇÃO DE CONTA

     ÚNICO LÁPIS DA CONTA
     ======================================================= */

  function openEdit(
    account: AccountWithBalance,
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
        formatValueForInput(
          account.calculatedBalance,
        ),
    });

    setAccountDialogOpen(
      true,
    );
  }


  /* =======================================================
     FECHAR DIALOG DA CONTA
     ======================================================= */

  function closeAccountDialog() {

    setAccountDialogOpen(
      false,
    );

    setEditing(
      null,
    );

    setForm(
      emptyForm(),
    );
  }


  /* =======================================================
     ABRIR EDIÇÃO DO TOTAL
     ======================================================= */

  function openEditTotal() {

    setTotalForm({
      total_balance:
        formatValueForInput(
          totalBalance,
        ),
    });

    setTotalDialogOpen(
      true,
    );
  }


  /* =======================================================
     CRIAR / EDITAR CONTA
     ======================================================= */

  async function submitAccount() {

    const name =
      form.name.trim();


    if (
      !name
    ) {
      toast.error(
        "Informe o nome da conta.",
      );

      return;
    }


    const desiredBalance =
      parseAmount(
        form.current_balance,
      );


    if (
      !Number.isFinite(
        desiredBalance,
      )
    ) {
      toast.error(
        "Informe um saldo válido.",
      );

      return;
    }


    try {

      /* ---------------------------------------------------
         EDITANDO CONTA EXISTENTE
         --------------------------------------------------- */

      if (
        editing
      ) {

        /*
         * O saldo atual é:
         *
         * initial_balance
         * +
         * balance_adjustment
         * +
         * transactionBalance
         *
         * Queremos encontrar um novo ajuste
         * que faça o resultado ser exatamente
         * o saldo digitado.
         */

        const initialBalance =
          Number(
            editing.initial_balance,
          );


        const safeInitialBalance =
          Number.isFinite(
            initialBalance,
          )
            ? initialBalance
            : 0;


        const newBalanceAdjustment =
          desiredBalance -
          safeInitialBalance -
          editing.transactionBalance;


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
            safeInitialBalance,

          balance_adjustment:
            newBalanceAdjustment,
        };


        await save.mutateAsync({
          id:
            editing.id,

          values,
        });


        toast.success(
          "Conta atualizada.",
        );


        closeAccountDialog();

        return;
      }


      /* ---------------------------------------------------
         NOVA CONTA
         --------------------------------------------------- */

      const values: AccountInput = {
        name:
          name.slice(
            0,
            100,
          ),

        type:
          form.type ||
          "conta",

        /*
         * Para uma conta nova,
         * o saldo digitado começa
         * como saldo inicial.
         */

        initial_balance:
          desiredBalance,

        balance_adjustment:
          0,
      };


      await save.mutateAsync({
        values,
      });


      toast.success(
        "Conta adicionada.",
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


  /* =======================================================
     EDITAR SALDO TOTAL
     ======================================================= */

  async function submitTotal() {

    const desiredTotal =
      parseAmount(
        totalForm.total_balance,
      );


    if (
      !Number.isFinite(
        desiredTotal,
      )
    ) {
      toast.error(
        "Informe um saldo total válido.",
      );

      return;
    }


    if (
      accounts.length === 0
    ) {
      toast.error(
        "Crie uma conta antes de editar o saldo total.",
      );

      return;
    }


    try {

      /*
       * Se o saldo atual for diferente de zero,
       * distribuímos proporcionalmente.
       */

      if (
        Math.abs(
          totalBalance,
        ) > 0.000001
      ) {

        await Promise.all(
          accounts.map(
            async (
              account,
            ) => {

              /*
               * Proporção desta conta.
               */

              const proportion =
                account.calculatedBalance /
                totalBalance;


              /*
               * Novo saldo desejado.
               */

              const newBalance =
                desiredTotal *
                proportion;


              /*
               * Ajuste necessário para
               * alcançar o novo saldo.
               */

              const initialBalance =
                Number(
                  account.initial_balance,
                );


              const safeInitialBalance =
                Number.isFinite(
                  initialBalance,
                )
                  ? initialBalance
                  : 0;


              const newAdjustment =
                newBalance -
                safeInitialBalance -
                account.transactionBalance;


              const values: AccountInput = {
                name:
                  account.name,

                type:
                  account.type ||
                  "conta",

                initial_balance:
                  safeInitialBalance,

                balance_adjustment:
                  newAdjustment,
              };


              await save.mutateAsync({
                id:
                  account.id,

                values,
              });
            },
          ),
        );

      } else {

        /*
         * Quando o total atual é zero,
         * não existe proporção.
         *
         * Nesse caso dividimos igualmente
         * entre todas as contas.
         */

        const amountPerAccount =
          desiredTotal /
          accounts.length;


        await Promise.all(
          accounts.map(
            async (
              account,
            ) => {

              const initialBalance =
                Number(
                  account.initial_balance,
                );


              const safeInitialBalance =
                Number.isFinite(
                  initialBalance,
                )
                  ? initialBalance
                  : 0;


              const newAdjustment =
                amountPerAccount -
                safeInitialBalance -
                account.transactionBalance;


              const values: AccountInput = {
                name:
                  account.name,

                type:
                  account.type ||
                  "conta",

                initial_balance:
                  safeInitialBalance,

                balance_adjustment:
                  newAdjustment,
              };


              await save.mutateAsync({
                id:
                  account.id,

                values,
              });
            },
          ),
        );
      }


      toast.success(
        "Saldo total atualizado.",
      );


      setTotalDialogOpen(
        false,
      );

    } catch (
      error
    ) {

      console.error(
        error,
      );


      toast.error(
        "Não foi possível atualizar o saldo total.",
      );
    }
  }


  /* =======================================================
     EXCLUIR
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

    } finally {

      setDeleting(
        null,
      );
    }
  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="space-y-6">

      {/* ===================================================
          CABEÇALHO
          =================================================== */}

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


      {/* ===================================================
          SALDO TOTAL
          =================================================== */}

      <div className="surface p-5">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <p className="text-sm text-muted-foreground">
                Saldo total
              </p>


              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="Editar saldo total"
                onClick={
                  openEditTotal
                }
              >
                <Pencil className="size-4" />
              </Button>

            </div>


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


      {/* ===================================================
          CARREGANDO
          =================================================== */}

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
          description="Cadastre uma conta para começar."
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


                    {/* ===============================
                        CABEÇALHO DA CONTA
                        =============================== */}

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


                    {/* ===============================
                        SALDO
                        SEM SEGUNDO LÁPIS
                        =============================== */}

                    <div className="mt-6">

                      <p
                        className={`text-2xl font-bold ${
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

                  </div>

                </div>
              );
            },
          )}

        </div>
      )}


      {/* ===================================================
          DIALOG CONTA
          =================================================== */}

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

              {editing
                ? "Editar conta"
                : "Adicionar conta"}

            </DialogTitle>


            <DialogDescription>

              {editing
                ? "Edite as informações e o saldo atual da conta."
                : "Crie uma nova conta e defina seu saldo atual."}

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
                  form.type
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

                  <SelectValue />

                </SelectTrigger>


                <SelectContent>

                  {ACCOUNT_TYPES.map(
                    (
                      item,
                    ) => (

                      <SelectItem
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {item.label}
                      </SelectItem>

                    ),
                  )}

                </SelectContent>

              </Select>

            </div>


            {/* SALDO ATUAL */}

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
                        event.target
                          .value,
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
                void submitAccount()
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
          DIALOG SALDO TOTAL
          =================================================== */}

      <Dialog
        open={
          totalDialogOpen
        }
        onOpenChange={
          setTotalDialogOpen
        }
      >

        <DialogContent className="sm:max-w-md">

          <DialogHeader>

            <DialogTitle>
              Editar saldo total
            </DialogTitle>


            <DialogDescription>
              O novo valor será distribuído entre todas as suas contas.
            </DialogDescription>

          </DialogHeader>


          <div className="space-y-1.5">

            <Label htmlFor="total-balance">
              Novo saldo total
            </Label>


            <Input
              id="total-balance"
              className="h-11"
              inputMode="decimal"
              placeholder="0,00"
              value={
                totalForm.total_balance
              }
              onChange={(
                event,
              ) =>
                setTotalForm({
                  total_balance:
                    event.target
                      .value,
                })
              }
            />

          </div>


          <DialogFooter>

            <Button
              className="h-11 w-full"
              onClick={() =>
                void submitTotal()
              }
              disabled={
                save.isPending
              }
            >
              {save.isPending
                ? "Salvando..."
                : "Salvar saldo total"}
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
                ? `"${deleting.name}" será excluída. As movimentações serão mantidas, mas ficarão sem conta vinculada.`
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