import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Crown,
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

import {
  useProfile,
  useTransactions,
} from "@/lib/data";

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

export const Route = createFileRoute(
  "/_authenticated/visao-geral",
)({
  head: () => ({
    meta: [
      {
        title: "Visão geral — FinanLook",
      },
      {
        name: "description",
        content:
          "Acompanhe seu saldo, entradas, gastos, evolução mensal e insights financeiros no FinanLook.",
      },
      {
        property: "og:title",
        content:
          "Visão geral — FinanLook",
      },
      {
        property: "og:description",
        content:
          "Sua vida financeira organizada em um só lugar.",
      },
    ],
  }),

  component: Overview,
});

/* =========================================================
   HELPERS DE MÊS
========================================================= */

function monthToDate(month: string) {
  const [year, monthNumber] =
    month.split("-").map(Number);

  return new Date(
    year,
    monthNumber - 1,
    1,
  );
}

function dateToMonth(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  return `${year}-${month}`;
}

function changeMonth(
  month: string,
  amount: number,
) {
  const date = monthToDate(month);

  date.setMonth(
    date.getMonth() + amount,
  );

  return dateToMonth(date);
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

function Overview() {
  const {
    data: profile,
  } = useProfile();

  const {
    data: transactions = [],
    isLoading,
  } = useTransactions();

  /*
   * IMPORTANTE:
   *
   * O mês selecionado começa sempre no mês atual.
   * Quando o usuário entrar novamente na página
   * em outro mês, automaticamente veremos o novo mês.
   *
   * O saldo NÃO usa esse mês.
   * Ele considera todas as movimentações.
   */

  const [selectedMonth, setSelectedMonth] =
    useState(currentMonthKey());

  const [showAllMonths, setShowAllMonths] =
    useState(false);

  const currentMonth =
    currentMonthKey();

  /*
   * Se o mês atual mudar enquanto a página
   * estiver aberta, atualiza o resumo.
   */
  useEffect(() => {
    setSelectedMonth(currentMonth);
  }, [currentMonth]);

  useEffect(() => {
    document.title =
      "Visão geral — FinanLook";
  }, []);

  /* =========================================================
     RESUMO DO MÊS SELECIONADO
  ========================================================= */

  const summary = useMemo(
    () =>
      summarizeMonth(
        transactions,
        selectedMonth,
      ),
    [transactions, selectedMonth],
  );

  /* =========================================================
     SALDO ATUAL
     
     Não depende do mês selecionado.
     Continua acumulando toda a vida financeira.
  ========================================================= */

  const balance = useMemo(
    () => totalBalance(transactions),
    [transactions],
  );

  /* =========================================================
     INSIGHTS
  ========================================================= */

  const insights = useMemo(
    () =>
      buildInsights(
        transactions,
        selectedMonth,
      ),
    [transactions, selectedMonth],
  );

  /* =========================================================
     DEMONSTRAÇÃO
  ========================================================= */

  const hasDemo =
    transactions.some(
      (transaction) =>
        transaction.is_demo,
    );

  /* =========================================================
     MAIORES GASTOS
  ========================================================= */

  const topExpenses = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.type ===
              "saida" &&
            transaction.date.slice(
              0,
              7,
            ) === selectedMonth,
        )
        .sort(
          (a, b) =>
            Number(b.amount) -
            Number(a.amount),
        )
        .slice(0, 5),
    [transactions, selectedMonth],
  );

  /* =========================================================
     EVOLUÇÃO DOS MESES
     
     Mostra os últimos meses que possuem
     movimentações.
  ========================================================= */

  const monthlyHistory = useMemo(() => {
    const months = new Set<string>();

    transactions.forEach(
      (transaction) => {
        months.add(
          transaction.date.slice(
            0,
            7,
          ),
        );
      },
    );

    /*
     * Também garante que o mês atual
     * apareça mesmo sem movimentações.
     */
    months.add(currentMonth);

    return Array.from(months)
      .sort()
      .reverse()
      .map((month) => {
        const data = summarizeMonth(
          transactions,
          month,
        );

        return {
          month,
          income: data.income,
          expenses: data.expenses,
          saved: data.saved,
          balance:
            data.income -
            data.expenses,
        };
      });
  }, [transactions, currentMonth]);

  /* =========================================================
     MÉDIA MENSAL
  ========================================================= */

  const averageMonthly = useMemo(() => {
    if (
      monthlyHistory.length === 0
    ) {
      return {
        income: 0,
        expenses: 0,
        saved: 0,
      };
    }

    const income =
      monthlyHistory.reduce(
        (total, month) =>
          total + month.income,
        0,
      ) / monthlyHistory.length;

    const expenses =
      monthlyHistory.reduce(
        (total, month) =>
          total + month.expenses,
        0,
      ) / monthlyHistory.length;

    const saved =
      monthlyHistory.reduce(
        (total, month) =>
          total + month.saved,
        0,
      ) / monthlyHistory.length;

    return {
      income,
      expenses,
      saved,
    };
  }, [monthlyHistory]);

  /* =========================================================
     MÊS ANTERIOR / PRÓXIMO
  ========================================================= */

  const previousMonth =
    changeMonth(
      selectedMonth,
      -1,
    );

  const nextMonth =
    changeMonth(
      selectedMonth,
      1,
    );

  const isCurrentMonth =
    selectedMonth === currentMonth;

  return (
    <div className="space-y-6">

      {/* =====================================================
          CABEÇALHO
      ====================================================== */}

      <header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">
              Olá,{" "}
              {profile?.name?.split(
                " ",
              )[0] || "tudo bem"}! 👋
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Veja como está sua vida
              financeira.
            </p>
          </div>

          {/* Botão VIP preparado para o futuro */}
          <Button
            variant="outline"
            className="h-11 gap-2"
            disabled
            title="Em breve"
          >
            <Crown className="size-4" />
            Recursos VIP
          </Button>
        </div>
      </header>

      {/* =====================================================
          SELETOR DE MÊS
      ====================================================== */}

      <section className="surface p-4">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <CalendarDays className="size-5 text-primary" />
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Resumo financeiro
              </p>

              <p className="font-display text-lg font-semibold">
                {monthLabel(
                  selectedMonth,
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              className="h-11"
              onClick={() =>
                setSelectedMonth(
                  previousMonth,
                )
              }
              aria-label="Mês anterior"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">
                Anterior
              </span>
            </Button>

            {!isCurrentMonth ? (
              <Button
                variant="secondary"
                className="h-11"
                onClick={() =>
                  setSelectedMonth(
                    currentMonth,
                  )
                }
              >
                Mês atual
              </Button>
            ) : null}

            <Button
              variant="outline"
              className="h-11"
              disabled={isCurrentMonth}
              onClick={() =>
                setSelectedMonth(
                  nextMonth,
                )
              }
              aria-label="Próximo mês"
            >
              <span className="hidden sm:inline">
                Próximo
              </span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          O resumo acima muda conforme o mês.
          Seu saldo atual continua acumulando
          todas as movimentações.
        </p>
      </section>

      {/* =====================================================
          AVISO DEMO
      ====================================================== */}

      {hasDemo ? (
        <p className="rounded-xl bg-warning/15 px-4 py-3 text-sm text-warning-foreground">
          Estes são dados de demonstração.
          Você pode apagá-los em
          Configurações.
        </p>
      ) : null}

      {/* =====================================================
          CARDS PRINCIPAIS
      ====================================================== */}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {/* SALDO ATUAL */}

        <Link
          to="/movimentacoes"
          className="block rounded-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Ver movimentações e saldo"
        >
          <StatCard
            label="Saldo atual"
            value={formatBRL(balance)}
            hint="Acumulado de todas as movimentações"
            icon={
              <Wallet className="size-4" />
            }
            tone={
              balance >= 0
                ? "positive"
                : "negative"
            }
          />
        </Link>

        {/* ENTRADAS DO MÊS */}

        <Link
          to="/movimentacoes"
          search={{
            tipo: "entrada",
          }}
          className="block rounded-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Ver entradas do mês"
        >
          <StatCard
            label="Entradas"
            value={formatBRL(
              summary.income,
            )}
            hint={`Total recebido em ${monthLabel(
              selectedMonth,
            )}`}
            icon={
              <ArrowUpRight className="size-4" />
            }
            tone="positive"
          />
        </Link>

        {/* GASTOS DO MÊS */}

        <Link
          to="/movimentacoes"
          search={{
            tipo: "saida",
          }}
          className="block rounded-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Ver gastos do mês"
        >
          <StatCard
            label="Gastos"
            value={formatBRL(
              summary.expenses,
            )}
            hint={`Total gasto em ${monthLabel(
              selectedMonth,
            )}`}
            icon={
              <ArrowDownRight className="size-4" />
            }
            tone="negative"
          />
        </Link>

        {/* GUARDADO */}

        <Link
          to="/reserva"
          className="block rounded-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
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
        </Link>
      </div>

      {/* =====================================================
          RESUMO RÁPIDO
      ====================================================== */}

      <section className="grid gap-3 sm:grid-cols-3">

        <div className="surface p-4">
          <p className="text-xs text-muted-foreground">
            Resultado do mês
          </p>

          <p
            className={`mt-1 text-xl font-semibold ${
              summary.income -
                summary.expenses >=
              0
                ? "text-success"
                : "text-destructive"
            }`}
          >
            {formatBRL(
              summary.income -
                summary.expenses,
            )}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Entradas − gastos
          </p>
        </div>

        <div className="surface p-4">
          <p className="text-xs text-muted-foreground">
            Média de entradas
          </p>

          <p className="mt-1 text-xl font-semibold">
            {formatBRL(
              averageMonthly.income,
            )}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Considerando meses registrados
          </p>
        </div>

        <div className="surface p-4">
          <p className="text-xs text-muted-foreground">
            Média de gastos
          </p>

          <p className="mt-1 text-xl font-semibold">
            {formatBRL(
              averageMonthly.expenses,
            )}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Considerando meses registrados
          </p>
        </div>
      </section>

      {/* =====================================================
          GASTOS POR CATEGORIA
      ====================================================== */}

      <section className="surface p-5">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <h2 className="font-display text-lg font-semibold">
              Onde seu dinheiro está indo?
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Gastos de{" "}
              {monthLabel(
                selectedMonth,
              )}
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-11"
          >
            <Link
              to="/movimentacoes"
              search={{
                tipo: "saida",
              }}
            >
              Ver todos os gastos
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Carregando...
          </p>
        ) : summary.byCategory.length ===
          0 ? (
          <div className="mt-4">
            <EmptyState
              emoji="📊"
              title="Ainda não há gastos neste mês"
              description="Adicione uma movimentação para começar a acompanhar seus gastos."
              action={
                <div className="mt-2 flex flex-wrap justify-center gap-2">

                  <Button
                    asChild
                    className="h-11"
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
                    className="h-11"
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
                (
                  item,
                  i,
                ) => (
                  <li
                    key={
                      item.category
                    }
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
                      ] ??
                        "•"}{" "}
                      {
                        item.category
                      }
                    </span>

                    <span className="font-medium">
                      {formatBRL(
                        item.total,
                      )}
                    </span>

                    <span className="w-10 text-right text-xs text-muted-foreground">
                      {summary.expenses >
                      0
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

      {/* =====================================================
          MAIORES GASTOS
      ====================================================== */}

      {topExpenses.length >
      0 ? (
        <section className="surface p-5">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>
              <h2 className="font-display text-lg font-semibold">
                Maiores gastos do mês
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Os gastos de maior valor em{" "}
                {monthLabel(
                  selectedMonth,
                )}
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              className="h-11"
            >
              <Link
                to="/movimentacoes"
                search={{
                  tipo: "saida",
                }}
              >
                Ver gastos
              </Link>
            </Button>
          </div>

          <ul className="mt-4 divide-y divide-border">

            {topExpenses.map(
              (transaction) => (
                <li
                  key={
                    transaction.id
                  }
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {
                        transaction.description
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_EMOJI[
                        transaction
                          .category
                      ] ??
                        "•"}{" "}
                      {
                        transaction.category
                      }{" "}
                      ·{" "}
                      {formatDateBR(
                        transaction.date,
                      )}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-semibold">
                    {formatBRL(
                      transaction.amount,
                    )}
                  </span>
                </li>
              ),
            )}

          </ul>
        </section>
      ) : null}

      {/* =====================================================
          EVOLUÇÃO MENSAL
      ====================================================== */}

      <section className="surface p-5">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <h2 className="font-display text-lg font-semibold">
              Evolução financeira
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Compare suas entradas, gastos e
              resultado ao longo dos meses.
            </p>
          </div>

          <Button
            variant="outline"
            className="h-11"
            onClick={() =>
              setShowAllMonths(
                (value) => !value,
              )
            }
          >
            {showAllMonths
              ? "Ocultar meses"
              : "Ver todos os meses"}

            {showAllMonths ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </div>

        <div className="mt-4 space-y-2">

          {(showAllMonths
            ? monthlyHistory
            : monthlyHistory.slice(
                0,
                4,
              )
          ).map((month) => (
            <button
              key={month.month}
              type="button"
              onClick={() =>
                setSelectedMonth(
                  month.month,
                )
              }
              className={`w-full rounded-xl border p-4 text-left transition-colors hover:bg-accent ${
                month.month ===
                selectedMonth
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                <div className="flex min-w-0 flex-1 items-center gap-3">

                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <CalendarDays className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {monthLabel(
                        month.month,
                      )}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Resultado:{" "}
                      <span
                        className={
                          month.balance >=
                          0
                            ? "text-success"
                            : "text-destructive"
                        }
                      >
                        {formatBRL(
                          month.balance,
                        )}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-right">

                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Entradas
                    </p>

                    <p className="text-sm font-semibold text-success">
                      {formatBRL(
                        month.income,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Gastos
                    </p>

                    <p className="text-sm font-semibold text-destructive">
                      {formatBRL(
                        month.expenses,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Guardado
                    </p>

                    <p className="text-sm font-semibold">
                      {formatBRL(
                        month.saved,
                      )}
                    </p>
                  </div>

                </div>
              </div>
            </button>
          ))}

        </div>

        {monthlyHistory.length ===
        0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Ainda não há histórico
            financeiro suficiente.
          </p>
        ) : null}
      </section>

      {/* =====================================================
          INSIGHTS
      ====================================================== */}

      <section className="surface p-5">

        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Sparkles className="size-4 text-primary" />
          Insights financeiros
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Pequenas observações para ajudar
          você a entender melhor seu dinheiro.
        </p>

        {insights.length ===
        0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Assim que você registrar
            algumas movimentações,
            mostramos observações sobre
            seus hábitos aqui.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">

            {insights.map(
              (text) => (
                <li
                  key={text}
                  className="rounded-xl bg-accent/50 px-4 py-3 text-sm"
                >
                  {text}
                </li>
              ),
            )}

          </ul>
        )}
      </section>

      {/* =====================================================
          ÁREA DE AÇÕES
      ====================================================== */}

      <section className="surface p-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="font-display text-lg font-semibold">
              Continue organizando suas finanças
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Registre entradas e gastos ou
              acompanhe suas contas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <Button
              asChild
              className="h-11"
            >
              <Link
                to="/movimentacoes"
                search={{
                  tipo: "entrada",
                }}
              >
                <ArrowUpRight className="size-4" />
                Adicionar entrada
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="h-11"
            >
              <Link
                to="/movimentacoes"
                search={{
                  tipo: "saida",
                }}
              >
                <ArrowDownRight className="size-4" />
                Adicionar gasto
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11"
            >
              <Link to="/contas">
                <Wallet className="size-4" />
                Minhas contas
              </Link>
            </Button>

          </div>
        </div>
      </section>

      {/* =====================================================
          FUTURO VIP
          
          Estrutura visual preparada.
          A funcionalidade real pode ser conectada
          posteriormente sem alterar o dashboard.
      ====================================================== */}

      <section className="surface overflow-hidden p-5">

        <div className="flex items-start gap-4">

          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Crown className="size-5 text-primary" />
          </div>

          <div className="min-w-0">

            <p className="text-sm font-semibold">
              FinanLook VIP
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Em breve, recursos avançados
              para deixar sua organização
              financeira ainda mais inteligente.
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-secondary px-3 py-1">
                📊 Relatórios avançados
              </span>

              <span className="rounded-full bg-secondary px-3 py-1">
                🤖 Insights inteligentes
              </span>

              <span className="rounded-full bg-secondary px-3 py-1">
                🔔 Automação
              </span>

              <span className="rounded-full bg-secondary px-3 py-1">
                📈 Análises avançadas
              </span>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}