import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChartPie,
  Lightbulb,
  PiggyBank,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions } from "@/lib/data";
import {
  addMonths,
  availableMonths,
  buildInsights,
  CATEGORY_EMOJI,
  CHART_COLORS,
  currentMonthKey,
  formatBRL,
  lastMonths,
  monthLabel,
  shortMonthLabel,
  summarizeMonth,
} from "@/lib/finance";

export const Route = createFileRoute(
  "/_authenticated/relatorios",
)({
  head: () => ({
    meta: [
      {
        title: "Relatórios — FinanLook",
      },
      {
        name: "description",
        content:
          "Relatório mensal com entradas, gastos, taxa de economia e insights sobre seus hábitos.",
      },
      {
        property: "og:title",
        content: "Relatórios — FinanLook",
      },
      {
        property: "og:description",
        content:
          "Relatório mensal com entradas, gastos, taxa de economia e insights sobre seus hábitos.",
      },
    ],
  }),

  component: ReportsPage,
});

function ReportsPage() {
  const transactionsQuery =
    useTransactions();

  const transactions =
    transactionsQuery.data ?? [];

  const monthOptions = useMemo(
    () =>
      availableMonths(transactions),
    [transactions],
  );

  const [month, setMonth] = useState(
    currentMonthKey(),
  );

  const summary = useMemo(
    () =>
      summarizeMonth(
        transactions,
        month,
      ),
    [transactions, month],
  );

  const previous = useMemo(
    () =>
      summarizeMonth(
        transactions,
        addMonths(month, -1),
      ),
    [transactions, month],
  );

  const evolution = useMemo(
    () =>
      lastMonths(6, month).map(
        (key) => {
          const data =
            summarizeMonth(
              transactions,
              key,
            );

          return {
            month:
              shortMonthLabel(key),
            entradas: data.income,
            gastos: data.expenses,
            guardado: data.saved,
          };
        },
      ),
    [transactions, month],
  );

  const insights = useMemo(
    () =>
      buildInsights(
        transactions,
        month,
      ),
    [transactions, month],
  );

  const expenseDelta =
    summary.expenses -
    previous.expenses;

  if (transactionsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Relatórios"
          subtitle="Um resumo claro do seu mês."
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map(
            (item) => (
              <Skeleton
                key={item}
                className="h-28 rounded-2xl"
              />
            ),
          )}
        </div>

        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (transactionsQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Relatórios"
          subtitle="Um resumo claro do seu mês."
        />

        <div className="surface p-5 text-sm text-destructive">
          Não conseguimos carregar seus dados agora.{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={() =>
              void transactionsQuery.refetch()
            }
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        subtitle="Compare seus meses, veja para onde vai seu dinheiro e receba insights."
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

      {transactions.length === 0 ? (
        <EmptyState
          emoji="📊"
          title="Nada para relatar ainda"
          description="Cadastre suas entradas e gastos para gerar o relatório mensal automaticamente."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Entradas"
              value={formatBRL(
                summary.income,
              )}
              icon={
                <ArrowUpRight className="size-5" />
              }
              tone="positive"
            />

            <StatCard
              label="Gastos"
              value={formatBRL(
                summary.expenses,
              )}
              hint={
                previous.expenses >
                0
                  ? `${
                      expenseDelta >=
                      0
                        ? "+"
                        : "-"
                    }${formatBRL(
                      Math.abs(
                        expenseDelta,
                      ),
                    )} vs. mês anterior`
                  : "Sem base de comparação"
              }
              icon={
                <ArrowDownRight className="size-5" />
              }
              tone={
                expenseDelta > 0
                  ? "negative"
                  : "neutral"
              }
            />

            <StatCard
              label="Guardado"
              value={formatBRL(
                summary.saved,
              )}
              icon={
                <PiggyBank className="size-5" />
              }
              tone="info"
            />

            <StatCard
              label="Taxa de economia"
              value={`${summary.savingRate.toFixed(
                0,
              )}%`}
              hint={`${summary.count} lançamentos`}
              icon={
                <ChartPie className="size-5" />
              }
              tone={
                summary.savingRate >=
                10
                  ? "positive"
                  : "neutral"
              }
            />
          </div>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-semibold">
              Evolução dos últimos 6 meses
            </h2>

            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={evolution}
                >
                  <XAxis
                    dataKey="month"
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                    tickFormatter={(
                      value: number,
                    ) =>
                      formatBRL(
                        value,
                      )
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        "var(--color-popover)",
                      border:
                        "1px solid var(--color-border)",
                      borderRadius: 12,
                      color:
                        "var(--color-popover-foreground)",
                    }}
                    formatter={(
                      value: number,
                    ) =>
                      formatBRL(
                        value,
                      )
                    }
                  />

                  <Bar
                    dataKey="entradas"
                    name="Entradas"
                    fill="var(--color-chart-1)"
                    radius={[
                      6, 6, 0, 0,
                    ]}
                  />

                  <Bar
                    dataKey="gastos"
                    name="Gastos"
                    fill="var(--color-chart-4)"
                    radius={[
                      6, 6, 0, 0,
                    ]}
                  />

                  <Bar
                    dataKey="guardado"
                    name="Guardado"
                    fill="var(--color-chart-2)"
                    radius={[
                      6, 6, 0, 0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="surface p-5">
              <h2 className="font-display text-lg font-semibold">
                Gastos por categoria
              </h2>

              {summary.byCategory
                .length === 0 ? (
                <EmptyState
                  emoji="🧾"
                  title="Nenhum gasto neste mês"
                  description="Quando você registrar gastos, eles aparecem aqui divididos por categoria."
                />
              ) : (
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={
                          summary.byCategory
                        }
                        dataKey="total"
                        nameKey="category"
                        innerRadius={
                          60
                        }
                        outerRadius={
                          100
                        }
                        paddingAngle={
                          2
                        }
                      >
                        {summary.byCategory.map(
                          (
                            item,
                            index,
                          ) => (
                            <Cell
                              key={
                                item.category
                              }
                              fill={
                                CHART_COLORS[
                                  index %
                                    CHART_COLORS.length
                                ]
                              }
                            />
                          ),
                        )}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          background:
                            "var(--color-popover)",
                          border:
                            "1px solid var(--color-border)",
                          borderRadius: 12,
                          color:
                            "var(--color-popover-foreground)",
                        }}
                        formatter={(
                          value: number,
                        ) =>
                          formatBRL(
                            value,
                          )
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="surface p-5">
              <h2 className="font-display text-lg font-semibold">
                Maiores gastos
              </h2>

              {summary.byCategory
                .length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Sem gastos registrados em{" "}
                  {monthLabel(month)}.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {summary.byCategory
                    .slice(0, 6)
                    .map((item) => (
                      <li
                        key={
                          item.category
                        }
                        className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3"
                      >
                        <span className="min-w-0 truncate text-sm font-medium">
                          <span aria-hidden>
                            {CATEGORY_EMOJI[
                              item
                                .category
                            ] ?? "💸"}
                          </span>{" "}
                          {
                            item.category
                          }
                        </span>

                        <span className="shrink-0 text-sm font-semibold">
                          {formatBRL(
                            item.total,
                          )}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </section>
          </div>

          <section className="surface p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <Lightbulb className="size-5 text-primary" />
              </div>

              <h2 className="font-display text-lg font-semibold">
                Insights de {monthLabel(month)}
              </h2>
            </div>

            {insights.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Continue registrando suas movimentações para receber insights
                personalizados.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {insights.map(
                  (insight) => (
                    <li
                      key={insight}
                      className="rounded-xl bg-muted/40 px-4 py-3 text-sm"
                    >
                      {insight}
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
