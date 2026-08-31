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
  const [
    month,
    setMonth,
  ] =
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
    toast.info(
      "A organização automática é um recurso Premium.",
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
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      <PageHeader
        title="Organizar salário"
        subtitle="Distribua seu saldo atual entre o que é importante para você."
      />

      {/* =================================================
          MÊS E SALDO
         ================================================= */}

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="surface min-w-0 overflow-hidden p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
              📅
            </div>

            <div className="min-w-0">
              <p className="break-words text-sm font-semibold">
                Mês da organização
              </p>

              <p className="break-words text-xs text-muted-foreground">
                Escolha o período que deseja planejar.
              </p>
            </div>
          </div>

          <Input
            type="month"
            className="mt-4 h-11 w-full max-w-full"
            value={month}
            onChange={(event) =>
              setMonth(
                event.target.value,
              )
            }
          />

          <p className="mt-3 break-words text-xs text-muted-foreground">
            {formatMonth(
              month,
            )}
          </p>
        </div>

        <div className="surface min-w-0 overflow-hidden p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Wallet className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="break-words text-sm font-semibold">
                Saldo atual disponível
              </p>

              <p className="break-words text-xs text-muted-foreground">
                Dinheiro atual somando todas as suas contas.
              </p>
            </div>
          </div>

          <p className="mt-4 break-words text-3xl font-bold">
            {formatBRL(
              currentBalance,
            )}
          </p>

          <p className="mt-2 break-words text-xs text-muted-foreground">
            Esse valor considera saldo inicial, ajustes, entradas e saídas.
          </p>
        </div>
      </div>

      {/* =================================================
          MODO
         ================================================= */}

      <div className="surface min-w-0 overflow-hidden p-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
          {/* ORGANIZAÇÃO MANUAL */}

          <Button
            type="button"
            variant="default"
            className="h-auto min-w-0 flex-1 items-start justify-start gap-3 whitespace-normal py-4"
          >
            <Edit3 className="mt-0.5 size-5 shrink-0" />

            <div className="min-w-0 text-left">
              <p className="break-words">
                Organização manual
              </p>

              <p className="mt-1 break-words whitespace-normal text-xs font-normal opacity-70">
                Você decide exatamente quanto colocar em cada categoria.
              </p>
            </div>
          </Button>

          {/* ORGANIZAÇÃO AUTOMÁTICA — APENAS UMA */}

          <Button
            type="button"
            variant="outline"
            className="h-auto min-w-0 flex-1 items-start justify-start gap-3 whitespace-normal py-4"
            onClick={
              useAutomaticOrganization
            }
          >
            <div className="relative mt-0.5 shrink-0">
              <Bot className="size-5" />

              <Crown className="absolute -right-3 -top-2 size-3" />
            </div>

            <div className="min-w-0 flex-1 text-left">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="break-words">
                  Organização automática
                </p>

                <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px]">
                  PREMIUM
                </span>
              </div>

              <p className="mt-1 break-words whitespace-normal text-xs font-normal text-muted-foreground">
                O FinanLook sugere uma divisão automática do seu dinheiro.
              </p>
            </div>
          </Button>
        </div>
      </div>

      {/* =================================================
          RESUMO
         ================================================= */}

      <div className="grid min-w-0 gap-4 md:grid-cols-3">
        <div className="surface min-w-0 overflow-hidden p-5">
          <p className="break-words text-sm text-muted-foreground">
            Saldo atual
          </p>

          <p className="mt-2 break-words text-xl font-bold">
            {formatBRL(
              currentBalance,
            )}
          </p>
        </div>

        <div className="surface min-w-0 overflow-hidden p-5">
          <p className="break-words text-sm text-muted-foreground">
            Já organizado
          </p>

          <p className="mt-2 break-words text-xl font-bold">
            {formatBRL(
              totalAllocated,
            )}
          </p>

          <p className="mt-1 break-words text-xs text-muted-foreground">
            {allocationPercentage.toFixed(
              1,
            )}
            % do saldo atual
          </p>
        </div>

        <div className="surface min-w-0 overflow-hidden p-5">
          <p className="break-words text-sm text-muted-foreground">
            Saldo restante
          </p>

          <p
            className={
              remainingBalance < 0
                ? "mt-2 break-words text-xl font-bold text-destructive"
                : "mt-2 break-words text-xl font-bold text-success"
            }
          >
            {formatBRL(
              remainingBalance,
            )}
          </p>

          <p className="mt-1 break-words text-xs text-muted-foreground">
            {remainingBalance < 0
              ? "Você passou do saldo disponível."
              : "Ainda disponível para organizar."}
          </p>
        </div>
      </div>

      {/* =================================================
          ORGANIZAÇÕES
         ================================================= */}

      <section className="min-w-0 space-y-4">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-semibold">
            Como deseja dividir seu dinheiro?
          </h2>

          <p className="break-words text-sm text-muted-foreground">
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
                className="surface min-w-0 overflow-hidden p-4"
              >
                <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg">
                      {
                        allocation.emoji
                      }
                    </span>

                    <div className="min-w-0">
                      <p className="break-words font-semibold">
                        {
                          allocation.name
                        }
                      </p>

                      <p className="break-words text-xs text-muted-foreground">
                        {
                          allocation.percentage.toFixed(
                            1,
                          )
                        }
                        % do saldo atual
                      </p>
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:w-[360px] lg:max-w-full">
                    <div className="min-w-0">
                      <Label className="text-xs">
                        Valor
                      </Label>

                      <Input
                        className="mt-1 h-10 w-full"
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

                    <div className="min-w-0">
                      <Label className="text-xs">
                        Porcentagem
                      </Label>

                      <div className="relative mt-1">
                        <Input
                          className="h-10 w-full pr-8"
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
                      className="shrink-0 self-end lg:self-auto"
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

      <div className="surface min-w-0 overflow-hidden p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <Plus className="size-5" />
          </div>

          <div className="min-w-0">
            <h2 className="break-words font-semibold">
              Nova organização personalizada
            </h2>

            <p className="break-words text-sm text-muted-foreground">
              Crie uma categoria que combine com a sua vida.
            </p>
          </div>
        </div>

        <div className="mt-4 flex min-w-0 flex-col gap-2 sm:flex-row">
          <Input
            className="h-11 min-w-0 flex-1"
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
            className="h-11 shrink-0"
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
          <p className="break-words font-semibold text-destructive">
            Você organizou mais dinheiro do que possui.
          </p>

          <p className="mt-1 break-words text-sm text-muted-foreground">
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
          className="h-11 whitespace-normal"
          onClick={
            clearAll
          }
        >
          <Minus className="size-4 shrink-0" />
          Limpar valores
        </Button>

        <Button
          type="button"
          className="h-11 whitespace-normal"
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
          <Save className="size-4 shrink-0" />

          {savePlan.isPending
            ? "Salvando..."
            : "Salvar organização"}
        </Button>
      </div>
    </div>
  );
}