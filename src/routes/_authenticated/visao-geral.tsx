import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  ChartNoAxesCombined,
  CircleDollarSign,
  PiggyBank,
  Sparkles,
  Wallet,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { useProfile, useTransactions } from "@/lib/data";
import {
  CATEGORY_EMOJI,
  CHART_COLORS,
  buildInsights,
  currentMonthKey,
  formatBRL,
  formatDateBR,
  monthLabel,
  summarizeMonth,
  totalBalance,
} from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/visao-geral")({
  head: () => ({
    meta: [
      { title: "Visão geral — FinanLook" },
      {
        name: "description",
        content:
          "Acompanhe seu saldo, entradas, gastos, reserva e insights financeiros no FinanLook.",
      },
      {
        property: "og:title",
        content: "Visão geral — FinanLook",
      },
      {
        property: "og:description",
        content:
          "Acompanhe sua vida financeira de forma simples e inteligente.",
      },
    ],
  }),

  component: Overview,
});

/**
 * Estrutura preparada para futuramente termos
 * insights gratuitos e insights VIP.
 *
 * Por enquanto todos são gratuitos.
 *
 * No futuro podemos trocar:
 *
 * const isVip = profile?.plan === "vip";
 *
 * e filtrar os insights premium aqui sem precisar
 * refazer toda a página.
 */
type SmartInsight = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: "positive" | "warning" | "neutral";
  vip?: boolean;
};

function Overview() {
  const { data: profile } = useProfile();
  const {
    data: transactions = [],
    isLoading,
  } = useTransactions();

  const month = currentMonthKey();

  const summary = summarizeMonth(
    transactions,
    month,
  );

  const insights = buildInsights(
    transactions,
    month,
  );

  const balance = totalBalance(
    transactions,
  );

  const hasDemo = transactions.some(
    (t) => t.is_demo,
  );

  useEffect(() => {
    document.title =
      "Visão geral — FinanLook";
  }, []);

  const monthTransactions = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.date.slice(0, 7) === month,
      ),
    [transactions, month],
  );

  const topExpenses = useMemo(
    () =>
      monthTransactions
        .filter(
          (t) => t.type === "saida",
        )
        .sort(
          (a, b) =>
            Number(b.amount) -
            Number(a.amount),
        )
        .slice(0, 5),
    [monthTransactions],
  );

  const totalMonthIncome = summary.income;
  const totalMonthExpenses =
    summary.expenses;

  const remaining =
    totalMonthIncome -
    totalMonthExpenses;

  const expensePercentage =
    totalMonthIncome > 0
      ? Math.round(
          (totalMonthExpenses /
            totalMonthIncome) *
            100,
        )
      : 0;

  const transactionCount =
    monthTransactions.length;

  const largestExpense =
    topExpenses[0] ?? null;

  const biggestCategory =
    summary.byCategory.length > 0
      ? [...summary.byCategory].sort(
          (a, b) =>
            Number(b.total) -
            Number(a.total),
        )[0]
      : null;

  /**
   * Insights inteligentes da página.
   *
   * Essa função é propositalmente local por enquanto.
   * Depois podemos mover para finance.ts e criar
   * uma camada de insights VIP com regras mais avançadas.
   */
  const smartInsights =
    useMemo<SmartInsight[]>(() => {
      const result: SmartInsight[] =
        [];

      if (
        totalMonthIncome > 0 &&
        totalMonthExpenses > 0
      ) {
        if (expensePercentage >= 90) {
          result.push({
            id: "expenses-critical",
            title: "Atenção aos gastos",
            description:
              `Você já utilizou ${expensePercentage}% do que entrou neste mês. Vale revisar os próximos gastos.`,
            icon: (
              <TrendingDown className="size-4" />
            ),
            tone: "warning",
          });
        } else if (
          expensePercentage >= 70
        ) {
          result.push({
            id: "expenses-high",
            title: "Gastos em ritmo alto",
            description:
              `Você já gastou ${expensePercentage}% das suas entradas deste mês. Ainda dá para ajustar o restante do mês.`,
            icon: (
              <ChartNoAxesCombined className="size-4" />
            ),
            tone: "warning",
          });
        } else {
          result.push({
            id: "expenses-controlled",
            title: "Boa margem neste mês",
            description:
              `Até agora, seus gastos representam ${expensePercentage}% das entradas.`,
            icon: (
              <TrendingUp className="size-4" />
            ),
            tone: "positive",
          });
        }
      }

      if (
        biggestCategory &&
        totalMonthExpenses > 0
      ) {
        const percentage = Math.round(
          (Number(
            biggestCategory.total,
          ) /
            totalMonthExpenses) *
            100,
        );

        result.push({
          id: "biggest-category",
          title: "Seu maior grupo de gastos",
          description:
            `${CATEGORY_EMOJI[biggestCategory.category] ?? "📌"} ${biggestCategory.category} representa ${percentage}% dos seus gastos deste mês, totalizando ${formatBRL(Number(biggestCategory.total))}.`,
          icon: (
            <CircleDollarSign className="size-4" />
          ),
          tone: "neutral",
        });
      }

      if (
        largestExpense
      ) {
        result.push({
          id: "largest-expense",
          title: "Maior gasto do mês",
          description:
            `${largestExpense.description} foi seu maior gasto, no valor de ${formatBRL(Number(largestExpense.amount))}, em ${formatDateBR(largestExpense.date)}.`,
          icon: (
            <ArrowDownRight className="size-4" />
          ),
          tone: "neutral",
        });
      }

      if (
        totalMonthIncome > 0 &&
        remaining > 0
      ) {
        result.push({
          id: "remaining",
          title: "Você ainda tem margem",
          description:
            `Depois dos gastos registrados, restam ${formatBRL(remaining)} das entradas deste mês.`,
          icon: (
            <Banknote className="size-4" />
          ),
          tone: "positive",
        });
      }

      if (
        summary.saved > 0
      ) {
        result.push({
          id: "saved",
          title: "Você está guardando dinheiro",
          description:
            `Já existem ${formatBRL(summary.saved)} direcionados para reserva, metas ou investimentos.`,
          icon: (
            <PiggyBank className="size-4" />
          ),
          tone: "positive",
        });
      }

      if (
        transactionCount >= 10
      ) {
        result.push({
          id: "activity",
          title: "Boa organização",
          description:
            `Você registrou ${transactionCount} movimentações neste mês. Quanto mais completo o registro, melhores ficam seus insights.`,
          icon: (
            <Sparkles className="size-4" />
          ),
          tone: "positive",
        });
      }

      /*
       * FUTURO VIP
       *
       * Exemplos de análises que podem entrar aqui:
       *
       * - comparação com meses anteriores;
       * - previsão de fechamento do mês;
       * - identificação de gastos recorrentes;
       * - categorias que mais cresceram;
       * - projeção de economia anual;
       * - recomendações personalizadas;
       * - análise de comportamento financeiro.
       *
       * Por enquanto não mostramos nada VIP.
       */

      return result;
    }, [
      totalMonthIncome,
      totalMonthExpenses,
      expensePercentage,
      remaining,
      biggestCategory,
      largestExpense,
      summary.saved,
      transactionCount,
    ]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">
              Olá,{" "}
              {profile?.name?.split(
                " ",
              )[0] || "tudo bem"}
              ! 👋
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Veja como está sua vida
              financeira.
            </p>

            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {monthLabel(month)}
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Link to="/movimentacoes">
              <PlusIcon />
              Registrar movimentação
            </Link>
          </Button>
        </div>
      </header>

      {/* DEMO */}
      {hasDemo ? (
        <p className="rounded-xl bg-warning/15 px-4 py-3 text-sm text-warning-foreground">
          Estes são dados de demonstração.
          Você pode apagá-los em
          Configurações.
        </p>
      ) : null}

      {/* STATS */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          to="/contas"
          className="group block rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Abrir contas e ver saldo"
        >
          <StatCard
            label="Saldo atual"
            value={formatBRL(balance)}
            hint="Ver suas contas e saldo"
            icon={
              <Wallet className="size-4" />
            }
            tone={
              balance >= 0
                ? "positive"
                : "negative"
            }
          />

          <p className="mt-1 px-2 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Clique para abrir suas
            contas →
          </p>
        </Link>

        <Link
          to="/movimentacoes"
          search={{ tipo: "entrada" }}
          className="group block rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Ver entradas"
        >
          <StatCard
            label="Entradas"
            value={formatBRL(
              summary.income,
            )}
            hint="Total recebido no mês"
            icon={
              <ArrowUpRight className="size-4" />
            }
            tone="positive"
          />

          <p className="mt-1 px-2 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Ver entradas →
          </p>
        </Link>

        <Link
          to="/movimentacoes"
          search={{ tipo: "saida" }}
          className="group block rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Ver gastos"
        >
          <StatCard
            label="Gastos"
            value={formatBRL(
              summary.expenses,
            )}
            hint="Total gasto no mês"
            icon={
              <ArrowDownRight className="size-4" />
            }
            tone="negative"
          />

          <p className="mt-1 px-2 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Ver gastos →
          </p>
        </Link>

        <Link
          to="/reserva"
          className="group block rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Abrir reserva"
        >
          <StatCard
            label="Valor guardado"
            value={formatBRL(
              summary.saved,
            )}
            hint="Reserva, metas e investimentos"
            icon={
              <PiggyBank className="size-4" />
            }
            tone="info"
          />

          <p className="mt-1 px-2 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Abrir reserva →
          </p>
        </Link>
      </div>

      {/* RESUMO DO MÊS */}
      {!isLoading &&
      monthTransactions.length > 0 ? (
        <section className="surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold">
                Resumo rápido
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Uma visão rápida de como
                seu mês está andando.
              </p>
            </div>

            <ChartNoAxesCombined className="size-5 text-primary" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-accent/50 p-4">
              <p className="text-xs text-muted-foreground">
                Movimentações
              </p>

              <p className="mt-1 text-xl font-semibold">
                {transactionCount}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                registradas este mês
              </p>
            </div>

            <div className="rounded-2xl bg-accent/50 p-4">
              <p className="text-xs text-muted-foreground">
                Percentual gasto
              </p>

              <p className="mt-1 text-xl font-semibold">
                {totalMonthIncome >
                0
                  ? `${expensePercentage}%`
                  : "—"}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                das entradas do mês
              </p>
            </div>

            <div className="rounded-2xl bg-accent/50 p-4">
              <p className="text-xs text-muted-foreground">
                Disponível
              </p>

              <p
                className={
                  "mt-1 text-xl font-semibold " +
                  (remaining >=
                  0
                    ? "text-success"
                    : "text-destructive")
                }
              >
                {formatBRL(
                  remaining,
                )}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                entradas menos gastos
              </p>
            </div>

            <div className="rounded-2xl bg-accent/50 p-4">
              <p className="text-xs text-muted-foreground">
                Maior categoria
              </p>

              <p className="mt-1 truncate text-xl font-semibold">
                {biggestCategory
                  ? `${CATEGORY_EMOJI[biggestCategory.category] ?? "📌"} ${biggestCategory.category}`
                  : "—"}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {biggestCategory
                  ? formatBRL(
                      Number(
                        biggestCategory.total,
                      ),
                    )
                  : "Nenhum gasto"}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* CATEGORIAS */}
      <section className="surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Onde seu dinheiro está indo?
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Veja quais categorias estão
              concentrando seus gastos.
            </p>
          </div>

          <Link
            to="/movimentacoes"
            search={{ tipo: "saida" }}
            className="hidden text-xs font-medium text-primary hover:underline sm:block"
          >
            Ver gastos →
          </Link>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Carregando...
          </p>
        ) : summary.byCategory
            .length === 0 ? (
          <div className="mt-4">
            <EmptyState
              emoji="📊"
              title="Ainda não há gastos neste mês"
              description="Adicione uma movimentação para começar a visualizar seus hábitos."
              action={
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <Button
                    asChild
                  >
                    <Link
                      to="/movimentacoes"
                      search={{
                        tipo: "entrada",
                      }}
                    >
                      Adicionar entrada
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="secondary"
                  >
                    <Link
                      to="/movimentacoes"
                      search={{
                        tipo: "saida",
                      }}
                    >
                      Adicionar gasto
                    </Link>
                  </Button>
                </div>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="h-60">
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
                    innerRadius={52}
                    outerRadius={86}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {summary.byCategory.map(
                      (
                        entry,
                        i,
                      ) => (
                        <Cell
                          key={
                            entry.category
                          }
                          fill={
                            CHART_COLORS[
                              i %
                                CHART_COLORS.length
                            ]
                          }
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(
                      value:
                        | number
                        | string,
                    ) =>
                      formatBRL(
                        Number(
                          value,
                        ),
                      )
                    }
                    contentStyle={{
                      borderRadius: 12,
                      border:
                        "1px solid var(--color-border)",
                      background:
                        "var(--color-card)",
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="space-y-2">
              {summary.byCategory.map(
                (item, i) => (
                  <li
                    key={
                      item.category
                    }
                    className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-accent/50"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        background:
                          CHART_COLORS[
                            i %
                              CHART_COLORS.length
                          ],
                      }}
                    />

                    <span className="flex-1 truncate">
                      {CATEGORY_EMOJI[
                        item.category
                      ] ??
                        "•"}{" "}
                      {
                        item.category
                      }
                    </span>

                    <span className="font-medium">
                      {formatBRL(
                        Number(
                          item.total,
                        ),
                      )}
                    </span>

                    <span className="w-10 text-right text-xs text-muted-foreground">
                      {summary.expenses >
                      0
                        ? Math.round(
                            (Number(
                              item.total,
                            ) /
                              summary.expenses) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        )}
      </section>

      {/* MAIORES GASTOS */}
      {topExpenses.length >
      0 ? (
        <section className="surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">
                Maiores gastos do mês
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Os gastos que mais impactaram
                seu mês.
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link
                to="/movimentacoes"
                search={{
                  tipo: "saida",
                }}
              >
                Ver todos
              </Link>
            </Button>
          </div>

          <ul className="mt-4 divide-y divide-border">
            {topExpenses.map(
              (t, index) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-semibold">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {
                          t.description
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_EMOJI[
                          t.category
                        ] ??
                          "•"}{" "}
                        {
                          t.category
                        }{" "}
                        ·{" "}
                        {formatDateBR(
                          t.date,
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-sm font-semibold">
                    {formatBRL(
                      Number(
                        t.amount,
                      ),
                    )}
                  </span>
                </li>
              ),
            )}
          </ul>
        </section>
      ) : null}

      {/* INSIGHTS */}
      <section className="surface overflow-hidden p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Sparkles className="size-4 text-primary" />
              Insights financeiros
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Pequenas observações para
              ajudar você a entender
              melhor seu dinheiro.
            </p>
          </div>

          <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary sm:block">
            Inteligente
          </span>
        </div>

        {smartInsights.length ===
        0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent">
              <Sparkles className="size-5 text-primary" />
            </div>

            <h3 className="mt-3 font-semibold">
              Seus insights estão
              esperando por você
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Registre algumas entradas
              e gastos para o FinanLook
              começar a identificar
              padrões na sua vida
              financeira.
            </p>

            <Button
              asChild
              className="mt-4"
            >
              <Link
                to="/movimentacoes"
                search={{
                  tipo: "saida",
                }}
              >
                Registrar primeiro gasto
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {smartInsights.map(
              (insight) => (
                <div
                  key={insight.id}
                  className="rounded-2xl bg-accent/50 p-4"
                >
                  <div className="flex gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                      {
                        insight.icon
                      }
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          {
                            insight.title
                          }
                        </h3>

                        {insight.vip ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase text-primary">
                            VIP
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        {
                          insight.description
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {insights.length >
        0 ? (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              💡 {insights[0]}
            </p>
          </div>
        ) : null}
      </section>

      {/* CTA FINAL */}
      <section className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Quer manter tudo em dia?
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Registre suas movimentações e
            deixe o FinanLook cuidar dos
            seus resumos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
          >
            <Link
              to="/contas"
            >
              <Wallet className="size-4" />
              Minhas contas
            </Link>
          </Button>

          <Button asChild>
            <Link
              to="/movimentacoes"
              search={{
                tipo: "saida",
              }}
            >
              <PlusIcon />
              Adicionar gasto
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function PlusIcon() {
  return (
    <span className="text-base leading-none">
      +
    </span>
  );
}