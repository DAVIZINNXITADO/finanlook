import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useMemo,
  useState,
} from "react";

import {
  Building2,
  Coins,
  Landmark,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  supabase,
} from "@/integrations/supabase/client";

import {
  PageHeader,
} from "@/components/PageHeader";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  toast,
} from "sonner";

export const Route =
  createFileRoute(
    "/_authenticated/investimentos",
  )({
    component:
      InvestmentsPage,
  });

/* =========================================================
   TIPOS
   ========================================================= */

type InvestmentCategory =
  | "renda_fixa"
  | "renda_variavel"
  | "fundos"
  | "cripto"
  | "outros";

type Investment = {
  id: string;

  user_id: string;

  name: string;

  category: InvestmentCategory;

  institution:
    | string
    | null;

  invested_amount: number;

  current_amount: number;

  investment_date:
    | string
    | null;

  created_at: string;

  updated_at: string;
};

/* =========================================================
   CATEGORIAS
   ========================================================= */

const CATEGORIES: {
  value: InvestmentCategory;
  label: string;
}[] = [
  {
    value: "renda_fixa",
    label: "Renda fixa",
  },

  {
    value: "renda_variavel",
    label: "Renda variável",
  },

  {
    value: "fundos",
    label: "Fundos",
  },

  {
    value: "cripto",
    label: "Criptoativos",
  },

  {
    value: "outros",
    label: "Outros",
  },
];

/* =========================================================
   OPÇÕES DE INVESTIMENTO
   ========================================================= */

const INVESTMENT_OPTIONS = [
  "Tesouro Direto",
  "CDB",
  "LCI",
  "LCA",
  "Ações",
  "Fundos Imobiliários",
  "ETF",
  "Fundos de Investimento",
  "Previdência",
  "Bitcoin",
  "Ethereum",
  "Poupança",
  "Outro",
];

/* =========================================================
   PÁGINA
   ========================================================= */

function InvestmentsPage() {
  const queryClient =
    useQueryClient();

  const [
    dialogOpen,
    setDialogOpen,
  ] =
    useState(false);

  const [
    editingInvestment,
    setEditingInvestment,
  ] =
    useState<
      Investment | null
    >(null);

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState<
      InvestmentCategory
    >("renda_fixa");

  const [
    institution,
    setInstitution,
  ] =
    useState("");

  const [
    investedAmount,
    setInvestedAmount,
  ] =
    useState("");

  const [
    currentAmount,
    setCurrentAmount,
  ] =
    useState("");

  const [
    investmentDate,
    setInvestmentDate,
  ] =
    useState("");

  /* =====================================================
     QUERY
     ===================================================== */

  const investmentsQuery =
    useQuery({
      queryKey: [
        "investments",
      ],

      queryFn:
        async () => {
          const {
            data:
              authData,
            error:
              authError,
          } =
            await supabase.auth.getUser();

          if (
            authError ||
            !authData.user
          ) {
            throw new Error(
              "Usuário não autenticado.",
            );
          }

          const {
            data,
            error,
          } =
            await supabase
              .from(
                "investments",
              )
              .select("*")
              .eq(
                "user_id",
                authData.user.id,
              )
              .order(
                "created_at",
                {
                  ascending:
                    false,
                },
              );

          if (error) {
            throw error;
          }

          return (
            data ??
            []
          ) as Investment[];
        },
    });

  const investments =
    investmentsQuery.data ??
    [];

  /* =====================================================
     TOTAIS
     ===================================================== */

  const totals =
    useMemo(() => {
      return investments.reduce(
        (
          accumulator,
          investment,
        ) => {
          accumulator.invested +=
            Number(
              investment.invested_amount,
            ) || 0;

          accumulator.current +=
            Number(
              investment.current_amount,
            ) || 0;

          return accumulator;
        },
        {
          invested: 0,
          current: 0,
        },
      );
    }, [
      investments,
    ]);

  /* =====================================================
     FORMULÁRIO
     ===================================================== */

  function resetForm() {
    setName("");

    setCategory(
      "renda_fixa",
    );

    setInstitution("");

    setInvestedAmount("");

    setCurrentAmount("");

    setInvestmentDate("");

    setEditingInvestment(
      null,
    );
  }

  function openCreateDialog() {
    resetForm();

    setDialogOpen(
      true,
    );
  }

  function openEditDialog(
    investment: Investment,
  ) {
    setEditingInvestment(
      investment,
    );

    setName(
      investment.name,
    );

    setCategory(
      investment.category,
    );

    setInstitution(
      investment.institution ??
        "",
    );

    setInvestedAmount(
      String(
        investment.invested_amount,
      ),
    );

    setCurrentAmount(
      String(
        investment.current_amount,
      ),
    );

    setInvestmentDate(
      investment.investment_date ??
        "",
    );

    setDialogOpen(
      true,
    );
  }

  /* =====================================================
     SALVAR
     ===================================================== */

  const saveMutation =
    useMutation({
      mutationFn:
        async () => {
          const cleanName =
            name.trim();

          if (
            !cleanName
          ) {
            throw new Error(
              "Informe o investimento.",
            );
          }

          const invested =
            Number(
              investedAmount
                .replace(
                  ",",
                  ".",
                ),
            );

          const current =
            Number(
              currentAmount
                .replace(
                  ",",
                  ".",
                ),
            );

          if (
            Number.isNaN(
              invested,
            ) ||
            invested < 0
          ) {
            throw new Error(
              "Informe um valor investido válido.",
            );
          }

          if (
            Number.isNaN(
              current,
            ) ||
            current < 0
          ) {
            throw new Error(
              "Informe um valor atual válido.",
            );
          }

          const {
            data:
              authData,
            error:
              authError,
          } =
            await supabase.auth.getUser();

          if (
            authError ||
            !authData.user
          ) {
            throw new Error(
              "Você precisa estar autenticado.",
            );
          }

          const payload = {
            name:
              cleanName,

            category,

            institution:
              institution.trim() ||
              null,

            invested_amount:
              invested,

            current_amount:
              current,

            investment_date:
              investmentDate ||
              null,
          };

          if (
            editingInvestment
          ) {
            const {
              error,
            } =
              await supabase
                .from(
                  "investments",
                )
                .update(
                  payload,
                )
                .eq(
                  "id",
                  editingInvestment.id,
                )
                .eq(
                  "user_id",
                  authData.user.id,
                );

            if (error) {
              throw error;
            }

            return;
          }

          const {
            error,
          } =
            await supabase
              .from(
                "investments",
              )
              .insert({
                ...payload,

                user_id:
                  authData.user.id,
              });

          if (error) {
            throw error;
          }
        },

      onSuccess:
        async () => {
          await queryClient.invalidateQueries({
            queryKey: [
              "investments",
            ],
          });

          toast.success(
            editingInvestment
              ? "Investimento atualizado."
              : "Investimento adicionado.",
          );

          setDialogOpen(
            false,
          );

          resetForm();
        },

      onError:
        (
          error,
        ) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Não foi possível salvar o investimento.",
          );
        },
    });

  /* =====================================================
     EXCLUIR
     ===================================================== */

  const deleteMutation =
    useMutation({
      mutationFn:
        async (
          id: string,
        ) => {
          const {
            error,
          } =
            await supabase
              .from(
                "investments",
              )
              .delete()
              .eq(
                "id",
                id,
              );

          if (error) {
            throw error;
          }
        },

      onSuccess:
        async () => {
          await queryClient.invalidateQueries({
            queryKey: [
              "investments",
            ],
          });

          toast.success(
            "Investimento removido.",
          );
        },

      onError: () => {
        toast.error(
          "Não foi possível remover o investimento.",
        );
      },
    });

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investimentos"
        subtitle="Acompanhe os investimentos que você possui."
        action={
          <Button
            onClick={
              openCreateDialog
            }
          >
            <Plus className="size-4" />

            Adicionar
          </Button>
        }
      />

      {/* =================================================
          RESUMO
         ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard
          title="Total investido"
          value={
            formatCurrency(
              totals.invested,
            )
          }
          icon={
            <WalletCards className="size-5" />
          }
        />

        <SummaryCard
          title="Valor atual"
          value={
            formatCurrency(
              totals.current,
            )
          }
          icon={
            <TrendingUp className="size-5" />
          }
        />
      </div>

      {/* =================================================
          LISTA
         ================================================= */}

      {investmentsQuery.isLoading ? (
        <div className="surface p-8 text-center text-sm text-muted-foreground">
          Carregando investimentos...
        </div>
      ) : investments.length ===
        0 ? (
        <div className="surface p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Coins className="size-7 text-primary" />
          </div>

          <h2 className="mt-4 font-display text-lg font-semibold">
            Nenhum investimento cadastrado
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Adicione os investimentos que você possui para acompanhar seus valores.
          </p>

          <Button
            className="mt-5"
            onClick={
              openCreateDialog
            }
          >
            <Plus className="size-4" />

            Adicionar investimento
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {investments.map(
            (
              investment,
            ) => (
              <InvestmentCard
                key={
                  investment.id
                }
                investment={
                  investment
                }
                onEdit={() =>
                  openEditDialog(
                    investment,
                  )
                }
                onDelete={() =>
                  deleteMutation.mutate(
                    investment.id,
                  )
                }
                deleting={
                  deleteMutation.isPending
                }
              />
            ),
          )}
        </div>
      )}

      {/* =================================================
          DIALOG
         ================================================= */}

      <Dialog
        open={
          dialogOpen
        }
        onOpenChange={(
          open,
        ) => {
          setDialogOpen(
            open,
          );

          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingInvestment
                ? "Editar investimento"
                : "Adicionar investimento"}
            </DialogTitle>

            <DialogDescription>
              Informe qual investimento você possui e em qual categoria ele se encaixa.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] space-y-4 overflow-y-auto px-1">
            {/* INVESTIMENTO */}

            <div className="space-y-2">
              <Label>
                Qual investimento você possui?
              </Label>

              <Select
                value={name}
                onValueChange={
                  setName
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Escolha um investimento" />
                </SelectTrigger>

                <SelectContent>
                  {INVESTMENT_OPTIONS.map(
                    (
                      option,
                    ) => (
                      <SelectItem
                        key={
                          option
                        }
                        value={
                          option
                        }
                      >
                        {option}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              {name ===
              "Outro" ? (
                <Input
                  className="h-11"
                  placeholder="Digite o nome do investimento"
                  onChange={(
                    event,
                  ) =>
                    setName(
                      event
                        .target
                        .value,
                    )
                  }
                />
              ) : null}
            </div>

            {/* CATEGORIA */}

            <div className="space-y-2">
              <Label>
                Em qual área?
              </Label>

              <Select
                value={
                  category
                }
                onValueChange={(
                  value,
                ) =>
                  setCategory(
                    value as InvestmentCategory,
                  )
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {CATEGORIES.map(
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

            {/* INSTITUIÇÃO */}

            <div className="space-y-2">
              <Label>
                Onde está investido?
              </Label>

              <Input
                className="h-11"
                value={
                  institution
                }
                onChange={(
                  event,
                ) =>
                  setInstitution(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Ex: Nubank, Inter, XP..."
              />
            </div>

            {/* VALORES */}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Quanto você investiu?
                </Label>

                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  className="h-11"
                  value={
                    investedAmount
                  }
                  onChange={(
                    event,
                  ) =>
                    setInvestedAmount(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Qual o valor atual?
                </Label>

                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  className="h-11"
                  value={
                    currentAmount
                  }
                  onChange={(
                    event,
                  ) =>
                    setCurrentAmount(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* DATA */}

            <div className="space-y-2">
              <Label>
                Data do investimento
              </Label>

              <Input
                type="date"
                className="h-11"
                value={
                  investmentDate
                }
                onChange={(
                  event,
                ) =>
                  setInvestmentDate(
                    event
                      .target
                      .value,
                  )
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              disabled={
                saveMutation.isPending
              }
              onClick={() =>
                saveMutation.mutate()
              }
            >
              {saveMutation.isPending
                ? "Salvando..."
                : editingInvestment
                  ? "Salvar alterações"
                  : "Adicionar investimento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================
   CARD DE RESUMO
   ========================================================= */

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 font-display text-2xl font-semibold">
            {value}
          </p>
        </div>

        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CARD DE INVESTIMENTO
   ========================================================= */

function InvestmentCard({
  investment,
  onEdit,
  onDelete,
  deleting,
}: {
  investment: Investment;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="surface p-5">
      <div className="flex gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <InvestmentIcon
            category={
              investment.category
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate font-display text-base font-semibold">
                {
                  investment.name
                }
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {getCategoryLabel(
                  investment.category,
                )}
              </p>
            </div>

            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={
                  onEdit
                }
              >
                <Pencil className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                disabled={
                  deleting
                }
                onClick={
                  onDelete
                }
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>

          {investment.institution ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="size-4" />

              <span>
                {
                  investment.institution
                }
              </span>
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                Investido
              </p>

              <p className="mt-1 font-semibold">
                {formatCurrency(
                  Number(
                    investment.invested_amount,
                  ),
                )}
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                Valor atual
              </p>

              <p className="mt-1 font-semibold">
                {formatCurrency(
                  Number(
                    investment.current_amount,
                  ),
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ÍCONE
   ========================================================= */

function InvestmentIcon({
  category,
}: {
  category: InvestmentCategory;
}) {
  switch (
    category
  ) {
    case "renda_fixa":
      return (
        <Landmark className="size-6" />
      );

    case "renda_variavel":
      return (
        <TrendingUp className="size-6" />
      );

    case "fundos":
      return (
        <WalletCards className="size-6" />
      );

    case "cripto":
      return (
        <Coins className="size-6" />
      );

    default:
      return (
        <TrendingUp className="size-6" />
      );
  }
}

/* =========================================================
   HELPERS
   ========================================================= */

function getCategoryLabel(
  category: InvestmentCategory,
) {
  return (
    CATEGORIES.find(
      (item) =>
        item.value ===
        category,
    )?.label ??
    "Outro"
  );
}

function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style:
        "currency",

      currency:
        "BRL",
    },
  ).format(
    value,
  );
}