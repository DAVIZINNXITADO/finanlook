import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bot,
  Crown,
  Edit3,
  Minus,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";

import {
  useSalaryPlan,
  useSaveSalaryPlan,
  useTotalAccountBalance,
} from "@/lib/hooks";

import {
  formatBRL,
  parseAmount,
} from "@/lib/finance";

export const Route = createFileRoute(
  "/_authenticated/organizar-salario",
)({
  head: () => ({
    meta: [
      {
        title: "Organizar salário — FinanLook",
      },
      {
        name: "description",
        content:
          "Organize seu saldo atual entre despesas, lazer, investimentos e reserva de emergência.",
      },
    ],
  }),

  component: OrganizeSalaryPage,
});

/* =========================================================
   TIPOS
   ========================================================= */

type OrganizationMode =
  | "manual"
  | "automatic";

type Allocation = {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  percentage: number;
  custom?: boolean;
};

/* =========================================================
   CATEGORIAS PADRÃO
   ========================================================= */

const DEFAULT_ALLOCATIONS: Allocation[] = [
  {
    id: "alimentacao",
    name: "Alimentação",
    emoji: "🍔",
    amount: 0,
    percentage: 0,
  },

  {
    id: "contas",
    name: "Contas",
    emoji: "🧾",
    amount: 0,
    percentage: 0,
  },

  {
    id: "transporte",
    name: "Transporte",
    emoji: "🚗",
    amount: 0,
    percentage: 0,
  },

  {
    id: "lazer",
    name: "Lazer",
    emoji: "🎮",
    amount: 0,
    percentage: 0,
  },

  {
    id: "investimentos",
    name: "Investimentos",
    emoji: "📈",
    amount: 0,
    percentage: 0,
  },

  {
    id: "reserva-emergencia",
    name: "Reserva de emergência",
    emoji: "🛟",
    amount: 0,
    percentage: 0,
  },
];

/* =========================================================
   MÊS
   ========================================================= */

function getCurrentMonth() {
  return new Date()
    .toISOString()
    .slice(0, 7);
}

function formatMonth(month: string) {
  if (!month) {
    return "";
  }

  const [
    year,
    monthNumber,
  ] =
    month.split("-");

  const date =
    new Date(
      Number(year),
      Number(monthNumber) - 1,
      1,
    );

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

/* =========================================================
   PÁGINA
   ========================================================= */

function OrganizeSalaryPage() {
  const [month, setMonth] =
    useState(
      getCurrentMonth(),
    );

  const {
    data: currentBalance = 0,
    isLoading: isLoadingBalance,
  } =
    useTotalAccountBalance();

  const {
    data: savedPlan,
    isLoading: isLoadingPlan,
  } =
    useSalaryPlan(month);

  const savePlan =
    useSaveSalaryPlan(month);

  const [
    mode,
    setMode,
  ] =
    useState<OrganizationMode>(
      "manual",
    );

  const [
    allocations,
    setAllocations,
  ] =
    useState<Allocation[]>(
      DEFAULT_ALLOCATIONS,
    );

  const [
    newCategoryName,
    setNewCategoryName,
  ] =
    useState("");

  /* =======================================================
     CARREGAR PLANO SALVO
     ======================================================= */

  useEffect(() => {
    if (!savedPlan) {
      setAllocations(
        DEFAULT_ALLOCATIONS,
      );

      return;
    }

    const saved =
      savedPlan.allocations ??
      {};

    const restored =
      DEFAULT_ALLOCATIONS.map(
        (allocation) => {
          const savedValue =
            Number(
              saved[
                allocation.name
              ] ?? 0,
            );

          const percentage =
            currentBalance > 0
              ? (
                  savedValue /
                  currentBalance
                ) *
                100
              : 0;

          return {
            ...allocation,
            amount:
              Number.isFinite(
                savedValue,
              )
                ? savedValue
                : 0,

            percentage,
          };
        },
      );

    /*
     * Recupera categorias personalizadas
     * que também estavam salvas.
     */

    const defaultNames =
      new Set(
        DEFAULT_ALLOCATIONS.map(
          (item) =>
            item.name,
        ),
      );

    const custom =
      Object.entries(
        saved,
      )
        .filter(
          ([name]) =>
            !defaultNames.has(
              name,
            ),
        )
        .map(
          ([
            name,
            value,
          ]) => {
            const amount =
              Number(
                value,
              ) || 0;

            return {
              id:
                `custom-${name}`,

              name,

              emoji:
                "✨",

              amount,

              percentage:
                currentBalance > 0
                  ? (
                      amount /
                      currentBalance
                    ) *
                    100
                  : 0,

              custom:
                true,
            };
          },
        );

    setAllocations([
      ...restored,
      ...custom,
    ]);
  }, [
    savedPlan,
    month,
    currentBalance,
  ]);

  /* =======================================================
     TOTAIS
     ======================================================= */

  const totalAllocated =
    useMemo(
      () =>
        allocations.reduce(
          (
            total,
            allocation,
          ) =>
            total +
            allocation.amount,
          0,
        ),
      [
        allocations,
      ],
    );

  const remainingBalance =
    currentBalance -
    totalAllocated;

  const allocationPercentage =
    currentBalance > 0
      ? (
          totalAllocated /
          currentBalance
        ) *
        100
      : 0;

  /* =======================================================
     ATUALIZAR VALOR
     ======================================================= */

  function updateAmount(
    id: string,
    value: string,
  ) {
    const amount =
      parseAmount(
        value,
      );

    setAllocations(
      (current) =>
        current.map(
          (
            allocation,
          ) => {
            if (
              allocation.id !==
              id
            ) {
              return allocation;
            }

            return {
              ...allocation,

              amount,

              percentage:
                currentBalance > 0
                  ? (
                      amount /
                      currentBalance
                    ) *
                    100
                  : 0,
            };
          },
        ),
    );
  }

  /* =======================================================
     ATUALIZAR PORCENTAGEM
     ======================================================= */

  function updatePercentage(
    id: string,
    value: string,
  ) {
    const percentage =
      Number(
        value.replace(
          ",",
          ".",
        ),
      );

    const safePercentage =
      Number.isFinite(
        percentage,
      )
        ? Math.max(
            0,
            percentage,
          )
        : 0;

    const amount =
      (
        currentBalance *
        safePercentage
      ) /
      100;

    setAllocations(
      (current) =>
        current.map(
          (
            allocation,
          ) => {
            if (
              allocation.id !==
              id
            ) {
              return allocation;
            }

            return {
              ...allocation,

              amount,

              percentage:
                safePercentage,
            };
          },
        ),
    );
  }

  /* =======================================================
     ADICIONAR PERSONALIZADA
     ======================================================= */

  function addCustomCategory() {
    const name =
      newCategoryName.trim();

    if (!name) {
      toast.error(
        "Digite o nome da nova organização.",
      );

      return;
    }

    const alreadyExists =
      allocations.some(
        (allocation) =>
          allocation.name
            .toLowerCase() ===
          name.toLowerCase(),
      );

    if (alreadyExists) {
      toast.error(
        "Essa organização já existe.",
      );

      return;
    }

    const id =
      `custom-${Date.now()}`;

    setAllocations(
      (current) => [
        ...current,

        {
          id,

          name:
            name.slice(
              0,
              60,
            ),

          emoji:
            "✨",

          amount:
            0,

          percentage:
            0,

          custom:
            true,
        },
      ],
    );

    setNewCategoryName("");

    toast.success(
      "Nova organização adicionada.",
    );
  }

  /* =======================================================
     REMOVER PERSONALIZADA
     ======================================================= */

  function removeCategory(
    id: string,
  ) {
    setAllocations(
      (current) =>
        current.filter(
          (
            allocation,
          ) =>
            allocation.id !==
            id,
        ),
    );
  }

  /* =======================================================
     ORGANIZAÇÃO AUTOMÁTICA
     ======================================================= */

  function useAutomaticOrganization() {
    /*
     * Aqui entra a verificação real
     * do plano Premium quando ela
     * existir no perfil.
     *
     * Por enquanto o botão informa
     * que a funcionalidade é Premium.
     */

    toast.info(
      "A organização automática é um recurso Premium.",
    );

    setMode(
      "automatic",
    );
  }

  /* =======================================================
     LIMPAR
     ======================================================= */

  function clearAll() {
    setAllocations(
      (current) =>
        current.map(
          (
            allocation,
          ) => ({
            ...allocation,
            amount: 0,
            percentage: 0,
          }),
        ),
    );

    toast.success(
      "Organização limpa.",
    );
  }

  /* =======================================================
     SALVAR
     ======================================================= */

  async function save() {
    if (
      currentBalance <= 0
    ) {
      toast.error(
        "Você precisa ter saldo atual para organizar.",
      );

      return;
    }

    if (
      totalAllocated >
      currentBalance
    ) {
      toast.error(
        "Você organizou mais dinheiro do que possui atualmente.",
      );

      return;
    }

    const allocationsObject =
      allocations.reduce<
        Record<
          string,
          number
        >
      >(
        (
          result,
          allocation,
        ) => {
          result[
            allocation.name
          ] =
            allocation.amount;

          return result;
        },
        {},
      );

    try {
      await savePlan.mutateAsync({
        /*
         * O income continua sendo
         * obrigatório para a tabela,
         * mas o planejamento usa
         * o saldo atual real.
         */

        income:
          currentBalance,

        allocations:
          allocationsObject,
      });

      toast.success(
        "Organização salva com sucesso.",
      );
    } catch {
      toast.error(
        "Não foi possível salvar sua organização.",
      );
    }
  }

  /* =======================================================
     LOADING
     ======================================================= */

  if (
    isLoadingBalance ||
    isLoadingPlan
  ) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Organizar salário"
          subtitle="Organize seu dinheiro de forma simples."
        />

        <p className="text-sm text-muted-foreground">
          Carregando...
        </p>
      </div>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizar salário"
        subtitle="Distribua seu saldo atual entre o que é importante para você."
      />

      {/* =================================================
          MÊS E SALDO
         ================================================= */}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-secondary">
              📅
            </div>

            <div>
              <p className="text-sm font-semibold">
                Mês da organização
              </p>

              <p className="text-xs text-muted-foreground">
                Escolha o período que deseja planejar.
              </p>
            </div>
          </div>

          <Input
            type="month"
            className="mt-4 h-11"
            value={month}
            onChange={(event) =>
              setMonth(
                event.target.value,
              )
            }
          />

          <p className="mt-3 text-xs text-muted-foreground">
            {formatMonth(
              month,
            )}
          </p>
        </div>

        <div className="surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-secondary">
              <Wallet className="size-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Saldo atual disponível
              </p>

              <p className="text-xs text-muted-foreground">
                Dinheiro atual somando todas as suas contas.
              </p>
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold">
            {formatBRL(
              currentBalance,
            )}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Esse valor considera saldo inicial, ajustes, entradas e saídas.
          </p>
        </div>
      </div>

      {/* =================================================
          MODO
         ================================================= */}

      <div className="surface p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant={
              mode === "manual"
                ? "default"
                : "outline"
            }
            className="h-auto flex-1 justify-start gap-3 py-4"
            onClick={() =>
              setMode(
                "manual",
              )
            }
          >
            <Edit3 className="size-5" />

            <div className="text-left">
              <p>
                Organização manual
              </p>

              <p className="text-xs font-normal opacity-70">
                Você decide exatamente quanto colocar em cada categoria.
              </p>
            </div>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-auto flex-1 justify-start gap-3 py-4"
            onClick={
              useAutomaticOrganization
            }
          >
            <div className="relative">
              <Bot className="size-5" />

              <Crown className="absolute -right-3 -top-2 size-3" />
            </div>

            <div className="text-left">
              <p className="flex items-center gap-2">
                Organização automática

                <span className="rounded-full border px-2 py-0.5 text-[10px]">
                  PREMIUM
                </span>
              </p>

              <p className="text-xs font-normal text-muted-foreground">
                O FinanLook sugere uma divisão automática do seu dinheiro.
              </p>
            </div>
          </Button>
        </div>

        {mode === "automatic" ? (
          <div className="mt-4 rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0" />

              <div>
                <p className="text-sm font-semibold">
                  Organização automática
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Este recurso estará disponível para usuários Premium.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* =================================================
          RESUMO
         ================================================= */}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface p-5">
          <p className="text-sm text-muted-foreground">
            Saldo atual
          </p>

          <p className="mt-2 text-xl font-bold">
            {formatBRL(
              currentBalance,
            )}
          </p>
        </div>

        <div className="surface p-5">
          <p className="text-sm text-muted-foreground">
            Já organizado
          </p>

          <p className="mt-2 text-xl font-bold">
            {formatBRL(
              totalAllocated,
            )}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {allocationPercentage.toFixed(
              1,
            )}
            % do saldo atual
          </p>
        </div>

        <div className="surface p-5">
          <p className="text-sm text-muted-foreground">
            Saldo restante
          </p>

          <p
            className={
              remainingBalance < 0
                ? "mt-2 text-xl font-bold text-destructive"
                : "mt-2 text-xl font-bold text-success"
            }
          >
            {formatBRL(
              remainingBalance,
            )}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {remainingBalance < 0
              ? "Você passou do saldo disponível."
              : "Ainda disponível para organizar."}
          </p>
        </div>
      </div>

      {/* =================================================
          ORGANIZAÇÕES
         ================================================= */}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            Como deseja dividir seu dinheiro?
          </h2>

          <p className="text-sm text-muted-foreground">
            Defina um valor ou uma porcentagem para cada organização.
          </p>
        </div>

        <div className="space-y-3">
          {allocations.map(
            (
              allocation,
            ) => (
              <div
                key={
                  allocation.id
                }
                className="surface p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg">
                      {
                        allocation.emoji
                      }
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {
                          allocation.name
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {
                          allocation.percentage.toFixed(
                            1,
                          )
                        }
                        % do saldo atual
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:w-[360px]">
                    <div>
                      <Label className="text-xs">
                        Valor
                      </Label>

                      <Input
                        className="mt-1 h-10"
                        inputMode="decimal"
                        placeholder="0,00"
                        value={
                          allocation.amount > 0
                            ? String(
                                allocation.amount,
                              ).replace(
                                ".",
                                ",",
                              )
                            : ""
                        }
                        onChange={(
                          event,
                        ) =>
                          updateAmount(
                            allocation.id,
                            event
                              .target
                              .value,
                          )
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-xs">
                        Porcentagem
                      </Label>

                      <div className="relative mt-1">
                        <Input
                          className="h-10 pr-8"
                          inputMode="decimal"
                          placeholder="0"
                          value={
                            allocation.percentage >
                            0
                              ? allocation.percentage.toFixed(
                                  1,
                                )
                              : ""
                          }
                          onChange={(
                            event,
                          ) =>
                            updatePercentage(
                              allocation.id,
                              event
                                .target
                                .value,
                            )
                          }
                        />

                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {allocation.custom ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remover organização"
                      onClick={() =>
                        removeCategory(
                          allocation.id,
                        )
                      }
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* =================================================
          NOVA ORGANIZAÇÃO
         ================================================= */}

      <div className="surface p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-secondary">
            <Plus className="size-5" />
          </div>

          <div>
            <h2 className="font-semibold">
              Nova organização personalizada
            </h2>

            <p className="text-sm text-muted-foreground">
              Crie uma categoria que combine com a sua vida.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            className="h-11 flex-1"
            placeholder="Ex.: Estudos, Pets, Viagem..."
            value={
              newCategoryName
            }
            onChange={(
              event,
            ) =>
              setNewCategoryName(
                event.target.value,
              )
            }
            onKeyDown={(
              event,
            ) => {
              if (
                event.key ===
                "Enter"
              ) {
                event.preventDefault();

                addCustomCategory();
              }
            }}
          />

          <Button
            type="button"
            className="h-11"
            onClick={
              addCustomCategory
            }
          >
            <Plus className="size-4" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* =================================================
          AVISO DE EXCESSO
         ================================================= */}

      {remainingBalance < 0 ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="font-semibold text-destructive">
            Você organizou mais dinheiro do que possui.
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Reduza{" "}
            {formatBRL(
              Math.abs(
                remainingBalance,
              ),
            )}{" "}
            das categorias antes de salvar.
          </p>
        </div>
      ) : null}

      {/* =================================================
          AÇÕES
         ================================================= */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={
            clearAll
          }
        >
          <Minus className="size-4" />
          Limpar valores
        </Button>

        <Button
          type="button"
          className="h-11"
          disabled={
            savePlan.isPending ||
            currentBalance <= 0 ||
            totalAllocated >
              currentBalance
          }
          onClick={() =>
            void save()
          }
        >
          <Save className="size-4" />

          {savePlan.isPending
            ? "Salvando..."
            : "Salvar organização"}
        </Button>
      </div>
    </div>
  );
}