import {
  createFileRoute,
} from "@tanstack/react-router";
import {
  useEffect,
  useState,
} from "react";
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
  LockKeyhole,
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
    ],
  }),

  component: AccountsPage,
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

const emptyForm = (): FormState => ({
  name: "",
  type: "conta",
  initial_balance: "0",
  balance_adjustment: "0",
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
] as const;

/*
 * Esta é a conta padrão automática do FinanLook.
 *
 * Ela não representa um banco.
 * É simplesmente a conta principal onde o app
 * guarda o saldo geral do usuário.
 */
const DEFAULT_ACCOUNT_NAME =
  "Saldo principal";

const DEFAULT_ACCOUNT_TYPE =
  "conta";

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
  } = useAccountsWithBalances();

  const save =
    useSaveAccount();

  const remove =
    useDeleteAccount();

  const [open, setOpen] =
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

  const [form, setForm] =
    useState<FormState>(
      emptyForm(),
    );

  const [
    defaultAccountCreating,
    setDefaultAccountCreating,
  ] =
    useState(false);

  /* =======================================================
     ENCONTRA CONTA PRINCIPAL
     ======================================================= */

  const defaultAccount =
    accounts.find(
      (account) =>
        account.name ===
        DEFAULT_ACCOUNT_NAME,
    );

  /*
   * O saldo total continua sendo a soma
   * de todas as contas.
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

  /* =======================================================
     CRIAR CONTA AUTOMÁTICA
     ======================================================= */

  useEffect(() => {
    /*
     * Não cria enquanto os dados
     * ainda estão carregando.
     */

    if (isLoading) {
      return;
    }

    /*
     * Se já existe, não faz nada.
     */

    if (defaultAccount) {
      return;
    }

    /*
     * Evita múltiplas tentativas
     * simultâneas.
     */

    if (
      defaultAccountCreating
    ) {
      return;
    }

    async function createDefaultAccount() {
      try {
        setDefaultAccountCreating(
          true,
        );

        const values: AccountInput =
          {
            name:
              DEFAULT_ACCOUNT_NAME,

            type:
              DEFAULT_ACCOUNT_TYPE,

            initial_balance: 0,

            balance_adjustment: 0,
          };

        await save.mutateAsync({
          values,
        });
      } catch (error) {
        console.error(
          "Erro ao criar conta principal:",
          error,
        );
      } finally {
        setDefaultAccountCreating(
          false,
        );
      }
    }

    void createDefaultAccount();
  }, [
    isLoading,
    defaultAccount,
    defaultAccountCreating,
    save,
  ]);

  /* =======================================================
     ABRIR NOVA CONTA
     ======================================================= */

  function openNew() {
    setEditing(null);

    setForm(
      emptyForm(),
    );

    setOpen(true);
  }

  /* =======================================================
     EDITAR CONTA
     ======================================================= */

  function openEdit(
    account: Account,
  ) {
    setEditing(account);

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

  /* =======================================================
     FECHAR
     ======================================================= */

  function closeDialog() {
    setOpen(false);

    setEditing(null);

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

    const values: AccountInput =
      {
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
      console.error(error);

      toast.error(
        "Não foi possível salvar a conta.",
      );
    }
  }

  /* =======================================================
     ALTERAR SALDO REAL
     ======================================================= */

  async function updateRealBalance(
    account: Account,
  ) {
    /*
     * O usuário informa o saldo que realmente
     * existe na conta.
     *
     * Exemplo:
     *
     * Saldo inicial:       100
     * Movimentações:       +50
     * Saldo calculado:     150
     *
     * Usuário diz que o saldo real é 200.
     *
     * O ajuste precisa ser:
     *
     * 200 - 100 - 50 = 50
     */

    const value =
      parseAmount(
        form.balance_adjustment,
      );

    if (
      !Number.isFinite(
        value,
      )
    ) {
      toast.error(
        "Informe um saldo válido.",
      );

      return;
    }

    const adjustment =
      value -
      Number(
        account.initial_balance,
      ) -
      Number(
        account.transactionBalance,
      );

    const values: AccountInput =
      {
        name:
          account.name,

        type:
          account.type,

        initial_balance:
          Number(
            account.initial_balance,
          ),

        balance_adjustment:
          adjustment,
      };

    try {
      await save.mutateAsync({
        id:
          account.id,

        values,
      });

      toast.success(
        "Saldo real atualizado.",
      );

      closeDialog();
    } catch (error) {
      console.error(error);

      toast.error(
        "Não foi possível atualizar o saldo.",
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

    /*
     * A conta principal não pode ser excluída.
     */

    if (
      deleting.name ===
      DEFAULT_ACCOUNT_NAME
    ) {
      toast.error(
        "A conta principal do FinanLook não pode ser excluída.",
      );

      setDeleting(null);

      return;
    }

    try {
      await remove.mutateAsync(
        deleting.id,
      );

      toast.success(
        "Conta excluída.",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Não foi possível excluir a conta.",
      );
    }

    setDeleting(null);
  }

  return (
    <div className="space-y-6">

      {/* ===================================================
          HEADER
          =================================================== */}

      <PageHeader
        title="Contas"
        subtitle="Acompanhe seu saldo principal e organize suas outras contas."
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
          CARREGAMENTO
          =================================================== */}

      {isLoading ||
      defaultAccountCreating ? (
        <p className="text-sm text-muted-foreground">
          Preparando suas contas...
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
          title="Preparando sua conta principal..."
          description="O FinanLook está criando seu espaço financeiro."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">

          {accounts.map(
            (
              account,
            ) => {
              const isDefault =
                account.name ===
                DEFAULT_ACCOUNT_NAME;

              const Icon =
                isDefault
                  ? Sparkles
                  : ACCOUNT_TYPES.find(
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

                    {/* CABEÇALHO */}

                    <div className="flex items-start gap-3">

                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
                        <Icon className="size-5" />
                      </span>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <div className="flex items-center gap-2">

                              <p className="truncate font-semibold">
                                {
                                  account.name
                                }
                              </p>

                              {isDefault ? (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                  Principal
                                </span>
                              ) : null}

                            </div>

                            <p className="text-xs text-muted-foreground">

                              {isDefault
                                ? "Conta automática do FinanLook"
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

                            {!isDefault ? (
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
                            ) : (
                              <span className="flex size-9 items-center justify-center">
                                <LockKeyhole className="size-4 text-muted-foreground" />
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* SALDO */}

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

                    {/* INFORMAÇÕES */}

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

                    {/* AJUSTE */}

                    {Number(
                      account.balance_adjustment,
                    ) !==
                    0 ? (
                      <div className="mt-3 rounded-lg bg-secondary/60 px-3 py-2">

                        <div className="flex items-center justify-between gap-3">

                          <span className="text-xs text-muted-foreground">
                            Ajuste para saldo real
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

      {/* =====================================================
          DIALOG
          ===================================================== */}

      <Dialog
        open={open}
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
                ? editing.name ===
                  DEFAULT_ACCOUNT_NAME
                  ? "Atualizar saldo principal"
                  : "Editar conta"
                : "Adicionar conta"}
            </DialogTitle>

            <DialogDescription>

              {editing?.name ===
              DEFAULT_ACCOUNT_NAME
                ? "Informe o saldo real atual. O FinanLook calculará automaticamente o ajuste necessário."
                : editing
                  ? "Atualize os dados da conta."
                  : "Cadastre uma nova conta para organizar suas movimentações."}

            </DialogDescription>

          </DialogHeader>

          <div className="space-y-4">

            {/* CONTA PRINCIPAL */}

            {editing?.name ===
            DEFAULT_ACCOUNT_NAME ? (

              <>
                <div className="rounded-xl border bg-secondary/50 p-4">

                  <p className="text-sm font-semibold">
                    Saldo principal
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Esta é sua conta financeira principal dentro do FinanLook. Não representa uma instituição bancária.
                  </p>

                </div>

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
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    Digite quanto você realmente possui agora. O app mantém as movimentações e calcula automaticamente a diferença.
                  </p>

                </div>
              </>

            ) : (

              <>

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
                            event
                              .target
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
                      <SelectValue />
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
                            {
                              label
                            }
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
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                  />

                </div>

                {/* AJUSTE */}

                <div className="space-y-1.5">

                  <Label htmlFor="balance-adjustment">
                    Ajuste manual
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
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                  />

                </div>

              </>

            )}

          </div>

          <DialogFooter>

            <Button
              className="h-11 w-full"
              disabled={
                save.isPending
              }
              onClick={() => {

                if (
                  editing?.name ===
                  DEFAULT_ACCOUNT_NAME
                ) {
                  void updateRealBalance(
                    editing,
                  );

                  return;
                }

                void submit();

              }}
            >

              {save.isPending
                ? "Salvando..."
                : editing?.name ===
                  DEFAULT_ACCOUNT_NAME
                  ? "Atualizar saldo real"
                  : editing
                    ? "Salvar alterações"
                    : "Adicionar conta"}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

      {/* =====================================================
          EXCLUIR
          ===================================================== */}

      <AlertDialog
        open={Boolean(
          deleting,
        )}
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
                ? `"${deleting.name}" será excluída. As movimentações continuarão existindo.`
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