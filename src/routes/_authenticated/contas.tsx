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
  name:
    string;

  type:
    string;

  current_balance:
    string;
};


/* =========================================================
   FORM VAZIO
   ========================================================= */

const emptyForm =
  (): FormState => ({
    name:
      "",

    type:
      "conta",

    current_balance:
      "",
  });


/* =========================================================
   TIPOS DE CONTA
   ========================================================= */

const ACCOUNT_TYPES = [
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

  /* =======================================================
     DADOS
     ======================================================= */

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


  /* =======================================================
     ESTADOS
     ======================================================= */

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
      AccountWithBalance |
      null
    >(
      null,
    );


  const [
    deleting,
    setDeleting,
  ] =
    useState<
      AccountWithBalance |
      null
    >(
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


    setOpen(
      true,
    );
  }


  /* =======================================================
     ABRIR EDIÇÃO
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
          account.calculatedBalance,
        ).replace(
          ".",
          ",",
        ),
    });


    setOpen(
      true,
    );
  }


  /* =======================================================
     FECHAR MODAL
     ======================================================= */

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


  /* =======================================================
     SALVAR
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
     * NOVA CONTA
     *
     * O saldo informado se torna
     * o saldo inicial.
     */

    if (!editing) {

      const values:
        AccountInput = {
          name,

          type:
            form.type ||
            "conta",

          initial_balance:
            currentBalance,

          balance_adjustment:
            0,
        };


      try {

        await save.mutateAsync({
          values,
        });


        toast.success(
          "Conta adicionada.",
        );


        closeDialog();

      } catch (
        error
      ) {

        console.error(
          error,
        );


        toast.error(
          "Não foi possível adicionar a conta.",
        );
      }

      return;
    }


    /*
     * EDITAR CONTA
     *
     * Mantemos:
     *
     * saldo inicial
     * +
     * movimentações
     *
     * E calculamos automaticamente
     * o ajuste necessário para chegar
     * no saldo real informado.
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


    const transactionBalance =
      editing.transactionBalance;


    const newAdjustment =
      currentBalance -
      safeInitialBalance -
      transactionBalance;


    const values:
      AccountInput = {
        name,

        type:
          form.type ||
          "conta",

        initial_balance:
          safeInitialBalance,

        balance_adjustment:
          newAdjustment,
      };


    try {

      await save.mutateAsync({
        id:
          editing.id,

        values,
      });


      toast.success(
        "Conta atualizada.",
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
     EXCLUIR
     ======================================================= */

  async function confirmDelete() {

    if (!deleting) {
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
          RESUMO
          =================================================== */}

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


      {/* ===================================================
          LOADING
          =================================================== */}

      {isLoading ? (

        <div className="surface p-6">

          <p className="text-sm text-muted-foreground">
            Carregando contas...
          </p>

        </div>


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

          title="Você ainda não possui contas"

          description="Crie uma conta para acompanhar seus saldos e movimentações."

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

                    {/* =====================================
                        CABEÇALHO DO CARD
                        ===================================== */}

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


                          {/* BOTÕES */}

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


                    {/* =====================================
                        SALDO
                        ===================================== */}

                    <div className="mt-6">

                      <p className="text-xs text-muted-foreground">
                        Saldo atual
                      </p>


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


                    {/* =====================================
                        INFORMAÇÕES
                        ===================================== */}

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


                    {/* =====================================
                        AJUSTE
                        ===================================== */}

                    {Number(
                      account.balance_adjustment,
                    ) !==
                    0 ? (

                      <div className="mt-3 rounded-lg bg-secondary/60 px-3 py-2">

                        <div className="flex items-center justify-between gap-3">

                          <span className="text-xs text-muted-foreground">
                            Ajuste de saldo
                          </span>


                          <span className="text-xs font-medium">

                            {Number(
                              account.balance_adjustment,
                            ) >=
                            0
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


      {/* ===================================================
          MODAL
          =================================================== */}

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

            return;
          }


          closeDialog();

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
                ? "Atualize os dados e informe o saldo real atual da conta."
                : "Cadastre uma nova conta e informe o saldo que ela possui atualmente."}

            </DialogDescription>

          </DialogHeader>


          <div className="space-y-4">


            {/* NOME */}

            <div className="space-y-1.5">

              <Label htmlFor="account-name">
                Nome da conta
              </Label>


              <Input
                id="account-name"

                className="h-11"

                placeholder="Ex: Minha conta principal"

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


            {/* SALDO REAL */}

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


              <p className="text-xs text-muted-foreground">

                Informe o saldo real que esta conta possui neste momento.

              </p>

            </div>


            {/* EXPLICAÇÃO */}

            <div className="rounded-xl border bg-secondary/50 p-3">

              <p className="text-xs text-muted-foreground">
                Como funciona
              </p>


              <p className="mt-1 text-sm font-medium">

                O FinanLook considera suas movimentações e ajusta o saldo para corresponder ao valor real informado.

              </p>

            </div>

          </div>


          {/* BOTÃO */}

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
                ? `"${deleting.name}" será excluída. As movimentações serão mantidas, mas deixarão de estar vinculadas a esta conta.`
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