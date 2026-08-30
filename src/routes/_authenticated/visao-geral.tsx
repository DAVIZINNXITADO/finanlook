import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Sparkles,
  Wallet,
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
          "Saldo, entradas, gastos e valor guardado do mês com gráficos por categoria.",
      },
      {
        property: "og:title",
        content: "Visão geral — FinanLook",
      },
      {
        property: "og:description",
        content: "Acompanhe sua vida financeira do mês.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data: profile } = useProfile();
  const { data: transactions = [], isLoading } = useTransactions();

  const month = currentMonthKey();
  const summary = summarizeMonth(transactions, month);
  const insights = buildInsights(transactions, month);
  const balance = totalBalance(transactions);
  const hasDemo = transactions.some((t) => t.is_demo);

  useEffect(() => {
    document.title = "Visão geral — FinanLook";
  }, []);

  const topExpenses = transactions
    .filter(
      (t) =>
        t.type === "saida" &&
        t.date.slice(0, 7) === month,
    )
    .sort(
      (a, b) =>
        Number(b.amount) - Number(a.amount),
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          Olá,{" "}
          {profile?.name?.split(" ")[0] ||
            "tudo bem"}! 👋
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Veja como está sua vida financeira.
        </p>

        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {monthLabel(month)}
        </p>
      </header>

      {hasDemo ? (
        <p className="rounded-xl bg-warning/15 px-4 py-3 text-sm text-warning-foreground">
          Estes são dados de demonstração. Você pode
          apagá-los em Configurações.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          to="/movimentacoes"
          className="block rounded-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Ver todas as movimentações"
        >
          <StatCard
            label="Saldo atual"
            value={formatBRL(balance)}
            hint="Entradas menos saídas · Ver movimentações"
            icon={<Wallet className="size-4" />}
            tone={
              balance >= 0
                ? "positive"
                : "negative"
            }
          />
        </Link>

        <Link
          to="/movimentacoes"
          search={{ tipo: "entrada" }}
          className="block rounded-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Ver entradas"
        >
          <StatCard
            label="Entradas"
            value={formatBRL(summary.income)}
            hint="Total recebido no mês · Ver entradas"
            icon={
              <ArrowUpRight className="size-4" />
            }
            tone="positive"
          />
        </Link>

        <Link
          to="/movimentacoes"
          search={{ tipo: "saida" }}
          className="block rounded-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Ver gastos"
        >
          <StatCard
            label="Gastos"
            value={formatBRL(summary.expenses)}
            hint="Total gasto no mês · Ver gastos"
            icon={
              <ArrowDownRight className="size-4" />
            }
            tone="negative"
          />
        </Link>

        <Link
          to="/reserva"
          className="block rounded-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Abrir minha reserva"
        >
          <StatCard
            label="Valor guardado"
            value={formatBRL(summary.saved)}
            hint="Reserva, metas e investimentos · Abrir reserva"
            icon={
              <PiggyBank className="size-4" />
            }
            tone="info"
          />
        </Link>
      </div>

      <section className="surface p-5">
        <h2 className="font-display text-lg font-semibold">
          Onde seu dinheiro está indo?
        </h2>

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Carregando...
          </p>
        ) : summary.byCategory.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              emoji="📊"
              title="Ainda não há gastos neste mês"
              description="Adicione sua primeira movimentação para ver seus gastos por categoria."
              action={
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <Button asChild>
                    <Link
                      to="/movimentacoes"
                      search={{ tipo: "entrada" }}
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
                      search={{ tipo: "saida" }}
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
                    data={summary.byCategory}
                    dataKey="total"
                    nameKey="category"
                    innerRadius={52}
                    outerRadius={86}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {summary.byCategory.map(
                      (entry, i) => (
                        <Cell
                          key={entry.category}
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
                      value: number | string,
                    ) =>
                      formatBRL(Number(value))
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
                    key={item.category}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span
                      className="size-2.5 rounded-full"
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
                      ] ?? "•"}{" "}
                      {item.category}
                    </span>

                    <span className="font-medium">
                      {formatBRL(item.total)}
                    </span>

                    <span className="w-10 text-right text-xs text-muted-foreground">
                      {summary.expenses > 0
                        ? Math.round(
                            (item.total /
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

      {topExpenses.length > 0 ? (
        <section className="surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">
              Maiores gastos do mês
            </h2>

            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link
                to="/movimentacoes"
                search={{ tipo: "saida" }}
              >
                Ver gastos
              </Link>
            </Button>
          </div>

          <ul className="mt-4 divide-y divide-border">
            {topExpenses.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {t.description}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_EMOJI[
                      t.category
                    ] ?? "•"}{" "}
                    {t.category} ·{" "}
                    {formatDateBR(t.date)}
                  </p>
                </div>

                <span className="shrink-0 text-sm font-semibold">
                  {formatBRL(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="surface p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Sparkles className="size-4 text-primary" />
          Insights financeiros
        </h2>

        {insights.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Assim que você registrar algumas
            movimentações, mostramos observações
            sobre seus hábitos aqui.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {insights.map((text) => (
              <li
                key={text}
                className="rounded-xl bg-accent/50 px-4 py-3 text-sm"
              >
                {text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}