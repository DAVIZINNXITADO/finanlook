import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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
  addMonths,
  availableMonths,
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
          "Acompanhe seu saldo, entradas, gastos, economia e evolução financeira.",
      },
      {
        property: "og:title",
        content: "Visão geral — FinanLook",
      },
      {
        property: "og:description",
        content: "Acompanhe sua vida financeira no FinanLook.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data: profile } = useProfile();
  const { data: transactions = [], isLoading } = useTransactions();

  /*
   * O mês inicial SEMPRE vem da data atual do dispositivo.
   * Não deixamos julho/agosto/etc. fixo no código.
   */
  const realCurrentMonth = currentMonthKey();

  const [selectedMonth, setSelectedMonth] =
    useState(realCurrentMonth);

  /*
   * Caso o mês atual mude enquanto a aplicação estiver aberta,
   * a visão acompanha automaticamente.
   */
  useEffect(() => {
    setSelectedMonth(realCurrentMonth);
  }, [realCurrentMonth]);

  useEffect(() => {
    document.title = "Visão geral — FinanLook";
  }, []);

  const summary = useMemo(
    () => summarizeMonth(transactions, selectedMonth),
    [transactions, selectedMonth],
  );

  /*
   * Saldo atual = histórico completo.
   * Isso é diferente do resultado apenas do mês selecionado.
   */
  const balance = useMemo(
    () => totalBalance(transactions),
    [transactions],
  );

  const insights = useMemo(
    () => buildInsights(transactions, selectedMonth),
    [transactions, selectedMonth],
  );

  const hasDemo = transactions.some((t) => t.is_demo);

  /*
   * Meses existentes + mês atual.
   * O usuário pode navegar mesmo quando ainda não há movimentações
   * no mês.
   */
  const months = useMemo(
    () => availableMonths(transactions),
    [transactions],
  );

  const selectedIndex = months.indexOf(selectedMonth);

  function previousMonth() {
    setSelectedMonth(addMonths(selectedMonth, -1));
  }

  function nextMonth() {
    const next = addMonths(selectedMonth, 1);

    /*
     * Não impedimos navegar para o mês atual.
     * Também permitimos meses futuros para planejamento.
     */
    setSelectedMonth(next);
  }

  const topExpenses = useMemo(
    () =>
      transactions
        .filter(
          (t) =>
            t.type === "saida" &&
            t.date.slice(0, 7) === selectedMonth &&
            !["Reserva de emergência", "Investimentos", "Metas"].includes(
              t.category,
            ),
        )
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 5),
    [transactions, selectedMonth],
  );

  /*
   * Evolução dos últimos 6 meses.
   * Valores ficam em colunas separadas para não sobrepor
   * quando houver números grandes.
   */
  const evolution = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const month = addMonths(selectedMonth, -(5 - index));
      const data = summarizeMonth(transactions, month);

      return {
        month,
        label: monthLabel(month).split(" de ")[0].slice(0, 3),
        income: data.income,
        expenses: data.expenses,
        saved: data.saved,
      };
    });
  }, [transactions, selectedMonth]);

  const maxEvolutionValue = Math.max(
    ...evolution.flatMap((item) => [
      item.income,
      item.expenses,
      item.saved,
    ]),
    1,
  );

  /*
   * Alguns insights adicionais.
   */
  const extraInsights = useMemo(() => {
    const result: string[] = [];

    const previous = summarizeMonth(
      transactions,
      addMonths(selectedMonth, -1),
    );

    if (summary.income > 0) {
      if (summary.balance > 0) {
        result.push(
          `Depois dos gastos e valores guardados, sobraram ${formatBRL(
            summary.balance,
          )} neste mês.`,
        );
      } else if (summary.balance < 0) {
        result.push(
          `Neste mês, seus gastos e valores guardados ultrapassaram as entradas em ${formatBRL(
            Math.abs(summary.balance),
          )}.`,
        );
      } else {
        result.push(
          "Neste mês, suas entradas foram totalmente utilizadas entre gastos e valores guardados.",
        );
      }
    }

    if (previous.income > 0 && summary.income > 0) {
      const incomeDiff = summary.income - previous.income;

      if (Math.abs(incomeDiff) >= 1) {
        result.push(
          incomeDiff > 0
            ? `Sua entrada aumentou ${formatBRL(
                incomeDiff,
              )} em relação ao mês anterior.`
            : `Sua entrada diminuiu ${formatBRL(
                Math.abs(incomeDiff),
              )} em relação ao mês anterior.`,
        );
      }
    }

    if (summary.saved > 0 && summary.income > 0) {
      if (summary.savingRate >= 20) {
        result.push(
          `Você guardou ${summary.savingRate.toFixed(
            0,
          )}% da renda neste mês.`,
        );
      } else if (summary.savingRate >= 10) {
        result.push(
          `Você conseguiu guardar ${summary.savingRate.toFixed(
            0,
          )}% da renda neste mês.`,
        );
      }
    }

    if (summary.count >= 5) {
      result.push(
        `Você registrou ${summary.count} movimentações em ${monthLabel(
          selectedMonth,
        )}.`,
      );
    }

    return result;
  }, [transactions, selectedMonth, summary]);

  const allInsights = [...insights, ...extraInsights].filter(
    (item, index, array) => array.indexOf(item) === index,
  );

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <header>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          Olá,{" "}
          {profile?.name?.split(" ")[0] || "tudo bem"}! 👋
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Veja como está sua vida financeira.
        </p>

        {/* CONTROLE DO MÊS */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              aria-label="Mês anterior"
              onClick={previousMonth}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="flex min-w-[170px] items-center justify-center gap-2 px-2 text-sm font-medium">
              <CalendarDays className="size-4 text-muted-foreground" />
              {monthLabel(selectedMonth)}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              aria-label="Próximo mês"
              onClick={nextMonth}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {selectedMonth !== realCurrentMonth ? (
            <Button
              variant="outline"
              className="h-11"
              onClick={() => setSelectedMonth(realCurrentMonth)}
            >
              Voltar para este mês
            </Button>
          ) : null}
        </div>

        {/* MESES DISPONÍVEIS */}
        {months.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {months.slice(0, 12).map((month) => (
              <Button
                key={month}
                variant={
                  selectedMonth === month
                    ? "default"
                    : "outline"
                }
                className="h-10 shrink-0"
                onClick={() => setSelectedMonth(month)}
              >
                {monthLabel(month)}
              </Button>
            ))}
          </div>
        ) : null}
      </header>

      {hasDemo ? (
        <p className="rounded-xl bg-warning/15 px-4 py-3 text-sm text-warning-foreground">
          Estes são dados de demonstração. Você pode apagá-los em
          Configurações.
        </p>
      ) : null}

      {/* CARDS PRINCIPAIS */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          to="/contas"
          className="block rounded-2xl transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Abrir contas"
        >
          <StatCard
            label="Saldo atual"
            value={formatBRL(balance)}
            hint="Saldo total · Abrir contas"
            icon={<Wallet className="size-4" />}
            tone={balance >= 0 ? "positive" : "negative"}
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
            hint={`Total recebido em ${monthLabel(
              selectedMonth,
            )}`}
            icon={<ArrowUpRight className="size-4" />}
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
            hint={`Gastos de ${monthLabel(selectedMonth)}`}
            icon={<ArrowDownRight className="size-4" />}
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
            hint="Reserva, metas e investimentos"
            icon={<PiggyBank className="size-4" />}
            tone="info"
          />
        </Link>
      </div>

      {/* RESUMO DO MÊS */}
      <section className="surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Resumo de {monthLabel(selectedMonth)}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Resultado do mês selecionado.
            </p>
          </div>

          <div className="rounded-xl bg-secondary px-4 py-3 text-right">
            <p className="text-xs text-muted-foreground">
              Resultado do mês
            </p>

            <p
              className={
                summary.balance >= 0
                  ? "mt-1 text-lg font-bold text-success"
                  : "mt-1 text-lg font-bold text-destructive"
              }
            >
              {formatBRL(summary.balance)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">
              Entradas
            </p>
            <p className="mt-1 text-lg font-semibold text-success">
              {formatBRL(summary.income)}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">
              Gastos
            </p>
            <p className="mt-1 text-lg font-semibold text-destructive">
              {formatBRL(summary.expenses)}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">
              Guardado
            </p>
            <p className="mt-1 text-lg font-semibold">
              {formatBRL(summary.saved)}
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="surface p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Onde seu dinheiro está indo?
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Distribuição dos gastos de {monthLabel(selectedMonth)}.
          </p>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Carregando...
          </p>
        ) : summary.byCategory.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              emoji="📊"
              title="Ainda não há gastos neste mês"
              description="Adicione uma movimentação para começar a acompanhar seus gastos."
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

                  <Button asChild variant="secondary">
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
              <ResponsiveContainer width="100%" height="100%">
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
                    {summary.byCategory.map((entry, i) => (
                      <Cell
                        key={entry.category}
                        fill={
                          CHART_COLORS[
                            i % CHART_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value: number | string) =>
                      formatBRL(Number(value))
                    }
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="space-y-2">
              {summary.byCategory.map((item, i) => (
                <li
                  key={item.category}
                  className="flex min-w-0 items-center gap-3 text-sm"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      background:
                        CHART_COLORS[
                          i % CHART_COLORS.length
                        ],
                    }}
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {CATEGORY_EMOJI[item.category] ?? "•"}{" "}
                    {item.category}
                  </span>

                  <span className="shrink-0 font-medium">
                    {formatBRL(item.total)}
                  </span>

                  <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                    {summary.expenses > 0
                      ? Math.round(
                          (item.total / summary.expenses) * 100,
                        )
                      : 0}
                    %
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* EVOLUÇÃO */}
      <section className="surface p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Evolução financeira
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Compare entradas, gastos e valores guardados nos últimos
            meses.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {evolution.map((item) => (
            <div key={item.month} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="w-16 shrink-0 text-sm font-medium capitalize">
                  {item.label}
                </span>

                <div className="grid min-w-0 flex-1 grid-cols-3 gap-2 text-right text-xs">
                  <span className="truncate text-success">
                    Entrada: {formatBRL(item.income)}
                  </span>

                  <span className="truncate text-destructive">
                    Gasto: {formatBRL(item.expenses)}
                  </span>

                  <span className="truncate">
                    Guardado: {formatBRL(item.saved)}
                  </span>
                </div>
              </div>

              <div className="grid gap-1.5">
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{
                      width: `${Math.max(
                        1,
                        (item.income / maxEvolutionValue) * 100,
                      )}%`,
                    }}
                  />
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-destructive transition-all"
                    style={{
                      width: `${Math.max(
                        item.expenses > 0 ? 1 : 0,
                        (item.expenses / maxEvolutionValue) * 100,
                      )}%`,
                    }}
                  />
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.max(
                        item.saved > 0 ? 1 : 0,
                        (item.saved / maxEvolutionValue) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-success" />
            Entradas
          </span>

          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-destructive" />
            Gastos
          </span>

          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" />
            Guardado
          </span>
        </div>
      </section>

      {/* MAIORES GASTOS */}
      {topExpenses.length > 0 ? (
        <section className="surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">
                Maiores gastos do mês
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Onde estão os maiores gastos de{" "}
                {monthLabel(selectedMonth)}.
              </p>
            </div>

            <Button asChild variant="outline" size="sm">
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
                    {CATEGORY_EMOJI[t.category] ?? "•"}{" "}
                    {t.category} · {formatDateBR(t.date)}
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

      {/* INSIGHTS */}
      <section className="surface p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Sparkles className="size-4 text-primary" />
          Insights financeiros
        </h2>

        {allInsights.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Assim que você registrar algumas movimentações,
            mostraremos observações sobre seus hábitos financeiros.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {allInsights.map((text) => (
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

      {/* PREPARAÇÃO PARA VIP */}
      <section className="surface overflow-hidden p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="size-5 text-primary" />
          </div>

          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold">
              Mais inteligência financeira
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              A estrutura da Visão Geral já está preparada para
              receber recursos avançados no futuro, como análises
              detalhadas, previsões, comparações e relatórios.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}