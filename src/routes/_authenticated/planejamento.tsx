import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarRange, Save, Target } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  useMonthlyPlans,
  useSaveMonthlyLimit,
  useTransactions,
} from "@/lib/data";
import {
  CATEGORY_EMOJI,
  currentMonthKey,
  formatBRL,
  lastMonths,
  monthLabel,
  parseAmount,
  SPENDING_CATEGORIES,
  summarizeMonth,
} from "@/lib/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute(
  "/_authenticated/planejamento",
)({
  head: () => ({
    meta: [
      {
        title: "Planejamento do mês — FinanLook",
      },
      {
        name: "description",
        content:
          "Defina limites de gastos por categoria e acompanhe o quanto já usou no mês.",
      },
      {
        property: "og:title",
        content: "Planejamento do mês — FinanLook",
      },
      {
        property: "og:description",
        content:
          "Defina limites de gastos por categoria e acompanhe o quanto já usou no mês.",
      },
    ],
  }),

  component: PlanningPage,
});

function PlanningPage() {
  const [month, setMonth] = useState(
    currentMonthKey(),
  );

  const monthOptions = useMemo(
    () => lastMonths(12).reverse(),
    [],
  );

  const transactionsQuery =
    useTransactions();

  const plansQuery =
    useMonthlyPlans(month);

  const saveLimit =
    useSaveMonthlyLimit(month);

  const [drafts, setDrafts] = useState<
    Record<string, string>
  >({});

  const summary = useMemo(
    () =>
      summarizeMonth(
        transactionsQuery.data ?? [],
        month,
      ),
    [transactionsQuery.data, month],
  );

  const limits = useMemo(() => {
    const map = new Map<
      string,
      number
    >();

    for (const plan of plansQuery
      .data ?? []) {
      map.set(
        plan.category,
        Number(plan.limit_amount),
      );
    }

    return map;
  }, [plansQuery.data]);

  const spentByCategory = useMemo(() => {
    const map = new Map<
      string,
      number
    >();

    for (const item of summary.byCategory) {
      map.set(
        item.category,
        item.total,
      );
    }

    return map;
  }, [summary]);

  const totalLimit = useMemo(
    () =>
      [...limits.values()].reduce(
        (total, value) =>
          total + value,
        0,
      ),
    [limits],
  );

  const loading =
    transactionsQuery.isLoading ||
    plansQuery.isLoading;

  const failed =
    transactionsQuery.isError ||
    plansQuery.isError;

  async function persist(
    category: string,
  ) {
    const raw =
      drafts[category] ?? "";

    const limit = parseAmount(raw);

    if (!Number.isFinite(limit)) {
      toast.error(
        "Informe um valor válido.",
      );

      return;
    }

    try {
      await saveLimit.mutateAsync({
        category,
        limit,
      });

      setDrafts((current) => {
        const next = { ...current };
        delete next[category];
        return next;
      });

      toast.success(
        limit > 0
          ? "Limite salvo."
          : "Limite removido.",
      );
    } catch {
      toast.error(
        "Não foi possível salvar o limite.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planejamento do mês"
        subtitle="Defina quanto pretende gastar em cada categoria e acompanhe o uso."
        action={
          <Select
            value={month}
            onValueChange={setMonth}
          >
            <SelectTrigger className="h-11 w-[190px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {monthOptions.map(
                (option) => (
                  <SelectItem
                    key={option}
                    value={option}
                  >
                    {monthLabel(
                      option,
                    )}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        }
      />

      {failed ? (
        <div className="surface p-5 text-sm text-destructive">
          Não conseguimos carregar seu planejamento agora.{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={() => {
              void transactionsQuery.refetch();
              void plansQuery.refetch();
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <Skeleton
              key={item}
              className="h-28 rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Limite planejado"
            value={formatBRL(
              totalLimit,
            )}
            icon={
              <Target className="size-5" />
            }
            tone="info"
          />

          <StatCard
            label="Gasto no mês"
            value={formatBRL(
              summary.expenses,
            )}
            icon={
              <CalendarRange className="size-5" />
            }
            tone={
              totalLimit > 0 &&
              summary.expenses >
                totalLimit
                ? "negative"
                : "neutral"
            }
          />

          <StatCard
            label="Disponível no plano"
            value={formatBRL(
              Math.max(
                totalLimit -
                  summary.expenses,
                0,
              ),
            )}
            hint={
              totalLimit === 0
                ? "Defina limites abaixo"
                : monthLabel(month)
            }
            tone="positive"
          />
        </div>
      )}

      <section className="surface overflow-hidden">
        <div className="border-b p-5">
          <h2 className="font-display text-lg font-semibold">
            Limites por categoria
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Deixe em zero para não acompanhar uma categoria.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3].map(
              (item) => (
                <Skeleton
                  key={item}
                  className="h-16 rounded-xl"
                />
              ),
            )}
          </div>
        ) : (
          <div className="divide-y">
            {SPENDING_CATEGORIES.map(
              (category) => {
                const limit =
                  limits.get(
                    category,
                  ) ?? 0;

                const spent =
                  spentByCategory.get(
                    category,
                  ) ?? 0;

                const percentage =
                  limit > 0
                    ? Math.min(
                        (spent /
                          limit) *
                          100,
                        100,
                      )
                    : 0;

                const over =
                  limit > 0 &&
                  spent > limit;

                const draft =
                  drafts[
                    category
                  ];

                return (
                  <div
                    key={category}
                    className="space-y-3 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">
                          <span aria-hidden>
                            {CATEGORY_EMOJI[
                              category
                            ] ?? "💸"}
                          </span>{" "}
                          {category}
                        </p>

                        <p
                          className={cn(
                            "mt-1 text-sm text-muted-foreground",
                            over &&
                              "text-destructive",
                          )}
                        >
                          {formatBRL(
                            spent,
                          )}{" "}
                          {limit > 0
                            ? `de ${formatBRL(
                                limit,
                              )}`
                            : "sem limite definido"}
                        </p>
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor={`limit-${category}`}
                            className="text-xs text-muted-foreground"
                          >
                            Limite
                          </Label>

                          <Input
                            id={`limit-${category}`}
                            inputMode="decimal"
                            className="h-11 w-32"
                            placeholder="0,00"
                            value={
                              draft ??
                              (limit >
                              0
                                ? String(
                                    limit,
                                  )
                                : "")
                            }
                            onChange={(
                              event,
                            ) =>
                              setDrafts(
                                (
                                  current,
                                ) => ({
                                  ...current,

                                  [category]:
                                    event
                                      .target
                                      .value,
                                }),
                              )
                            }
                          />
                        </div>

                        <Button
                          className="h-11"
                          variant={
                            draft ===
                            undefined
                              ? "outline"
                              : "default"
                          }
                          disabled={
                            draft ===
                              undefined ||
                            saveLimit.isPending
                          }
                          onClick={() =>
                            void persist(
                              category,
                            )
                          }
                        >
                          <Save className="size-4" />

                          Salvar
                        </Button>
                      </div>
                    </div>

                    {limit > 0 ? (
                      <Progress
                        value={
                          percentage
                        }
                        className={cn(
                          over &&
                            "[&>div]:bg-destructive",
                        )}
                      />
                    ) : null}
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}
