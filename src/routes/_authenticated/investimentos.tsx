import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  BarChart3,
  Calculator,
  CalendarDays,
  Coins,
  Landmark,
  PieChart,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute(
  "/_authenticated/investimentos",
)({
  component: InvestimentosPage,
});

/* =========================================================
   TIPOS
   ========================================================= */

type InvestmentCategory =
  | "Todos"
  | "Ações"
  | "FIIs"
  | "Renda fixa"
  | "ETFs"
  | "Cripto";

type Investment = {
  symbol: string;
  name: string;
  category: Exclude<
    InvestmentCategory,
    "Todos"
  >;
  description: string;
  annualRate: number;
};

/* =========================================================
   DADOS PARA PESQUISA
   ========================================================= */

const INVESTMENTS: Investment[] = [
  {
    symbol: "PETR4",
    name: "Petrobras PN",
    category: "Ações",
    description:
      "Ação de uma empresa do setor de energia.",
    annualRate: 12,
  },
  {
    symbol: "VALE3",
    name: "Vale ON",
    category: "Ações",
    description:
      "Ação de uma empresa do setor de mineração.",
    annualRate: 11,
  },
  {
    symbol: "ITUB4",
    name: "Itaú Unibanco PN",
    category: "Ações",
    description:
      "Ação do setor financeiro.",
    annualRate: 10,
  },
  {
    symbol: "BBAS3",
    name: "Banco do Brasil ON",
    category: "Ações",
    description:
      "Ação do setor bancário.",
    annualRate: 10,
  },
  {
    symbol: "MXRF11",
    name: "Maxi Renda",
    category: "FIIs",
    description:
      "Fundo imobiliário.",
    annualRate: 11,
  },
  {
    symbol: "HGLG11",
    name: "CSHG Logística",
    category: "FIIs",
    description:
      "Fundo imobiliário do setor logístico.",
    annualRate: 10,
  },
  {
    symbol: "KNRI11",
    name: "Kinea Renda Imobiliária",
    category: "FIIs",
    description:
      "Fundo imobiliário diversificado.",
    annualRate: 9,
  },
  {
    symbol: "TESOURO SELIC",
    name: "Tesouro Selic",
    category: "Renda fixa",
    description:
      "Título público pós-fixado.",
    annualRate: 10,
  },
  {
    symbol: "TESOURO IPCA+",
    name: "Tesouro IPCA+",
    category: "Renda fixa",
    description:
      "Título público indexado à inflação.",
    annualRate: 9,
  },
  {
    symbol: "CDB",
    name: "CDB",
    category: "Renda fixa",
    description:
      "Certificado de Depósito Bancário.",
    annualRate: 11,
  },
  {
    symbol: "BOVA11",
    name: "iShares Ibovespa",
    category: "ETFs",
    description:
      "ETF que acompanha o Ibovespa.",
    annualRate: 10,
  },
  {
    symbol: "IVVB11",
    name: "iShares S&P 500",
    category: "ETFs",
    description:
      "ETF com exposição ao mercado americano.",
    annualRate: 11,
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    category: "Cripto",
    description:
      "Criptoativo digital.",
    annualRate: 20,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    category: "Cripto",
    description:
      "Plataforma e criptoativo digital.",
    annualRate: 18,
  },
];

const CATEGORIES: InvestmentCategory[] = [
  "Todos",
  "Ações",
  "FIIs",
  "Renda fixa",
  "ETFs",
  "Cripto",
];

/* =========================================================
   FORMATADORES
   ========================================================= */

function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  ).format(value);
}

function formatNumber(
  value: number,
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      maximumFractionDigits: 2,
    },
  ).format(value);
}

/* =========================================================
   COMPONENTE PRINCIPAL
   ========================================================= */

function InvestimentosPage() {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState<InvestmentCategory>(
      "Todos",
    );

  const [
    selectedInvestment,
    setSelectedInvestment,
  ] =
    useState<Investment | null>(
      null,
    );

  const [
    initialAmount,
    setInitialAmount,
  ] =
    useState("1000");

  const [
    monthlyAmount,
    setMonthlyAmount,
  ] =
    useState("500");

  const [
    years,
    setYears,
  ] =
    useState("5");

  const [
    annualRate,
    setAnnualRate,
  ] =
    useState("10");

  /* =======================================================
     FILTRO DA PESQUISA
     ======================================================= */

  const filteredInvestments =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return INVESTMENTS.filter(
        (investment) => {
          const matchesCategory =
            category === "Todos" ||
            investment.category ===
              category;

          const matchesSearch =
            !normalizedSearch ||
            investment.symbol
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            investment.name
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            investment.category
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          return (
            matchesCategory &&
            matchesSearch
          );
        },
      );
    }, [
      search,
      category,
    ]);

  /* =======================================================
     VALORES DA SIMULAÇÃO
     ======================================================= */

  const simulation =
    useMemo(() => {
      const initial =
        Number(
          initialAmount.replace(
            ",",
            ".",
          ),
        ) || 0;

      const monthly =
        Number(
          monthlyAmount.replace(
            ",",
            ".",
          ),
        ) || 0;

      const totalYears =
        Math.max(
          0,
          Number(years) || 0,
        );

      const annual =
        Number(
          annualRate.replace(
            ",",
            ".",
          ),
        ) || 0;

      const months =
        Math.round(
          totalYears * 12,
        );

      const monthlyRate =
        Math.pow(
          1 + annual / 100,
          1 / 12,
        ) - 1;

      let finalValue =
        initial;

      for (
        let month = 0;
        month < months;
        month++
      ) {
        finalValue =
          finalValue *
            (
              1 +
              monthlyRate
            ) +
          monthly;
      }

      const invested =
        initial +
        monthly * months;

      const earnings =
        Math.max(
          0,
          finalValue - invested,
        );

      return {
        initial,
        monthly,
        months,
        finalValue,
        invested,
        earnings,
      };
    }, [
      initialAmount,
      monthlyAmount,
      years,
      annualRate,
    ]);

  /* =======================================================
     SELECIONAR INVESTIMENTO
     ======================================================= */

  function selectInvestment(
    investment: Investment,
  ) {
    setSelectedInvestment(
      investment,
    );

    setAnnualRate(
      String(
        investment.annualRate,
      ),
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investimentos"
        subtitle="Pesquise investimentos e simule diferentes cenários."
      />

      {/* ===============================================
          RESUMO
         =============================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          icon={
            <Wallet className="size-5" />
          }
          label="Total investido"
          value={formatCurrency(
            simulation.invested,
          )}
        />

        <SummaryCard
          icon={
            <TrendingUp className="size-5" />
          }
          label="Rendimento estimado"
          value={formatCurrency(
            simulation.earnings,
          )}
          positive
        />

        <SummaryCard
          icon={
            <PieChart className="size-5" />
          }
          label="Valor futuro"
          value={formatCurrency(
            simulation.finalValue,
          )}
        />
      </div>

      {/* ===============================================
          PESQUISAR INVESTIMENTO
         =============================================== */}

      <section className="surface p-5">
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <Search className="size-5 text-primary" />
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold">
                  Pesquisar investimento
                </h2>

                <p className="text-sm text-muted-foreground">
                  Procure por nome,
                  código ou categoria.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Ex.: PETR4, Bitcoin, Tesouro..."
              className="h-11 pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(
              (
                currentCategory,
              ) => (
                <button
                  key={
                    currentCategory
                  }
                  type="button"
                  onClick={() =>
                    setCategory(
                      currentCategory,
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",

                    category ===
                      currentCategory
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted",
                  )}
                >
                  {
                    currentCategory
                  }
                </button>
              ),
            )}
          </div>

          <div className="grid gap-3">
            {filteredInvestments
              .slice(
                0,
                8,
              )
              .map(
                (
                  investment,
                ) => (
                  <button
                    key={
                      investment.symbol
                    }
                    type="button"
                    onClick={() =>
                      selectInvestment(
                        investment,
                      )
                    }
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:bg-muted/50",

                      selectedInvestment
                        ?.symbol ===
                        investment.symbol &&
                        "border-primary bg-primary/5",
                    )}
                  >
                    <InvestmentIcon
                      category={
                        investment.category
                      }
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {
                            investment.symbol
                          }
                        </p>

                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          {
                            investment.category
                          }
                        </span>
                      </div>

                      <p className="truncate text-sm text-muted-foreground">
                        {
                          investment.name
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">
                        ~
                        {
                          investment.annualRate
                        }
                        % a.a.
                      </p>

                      <p className="hidden text-xs text-muted-foreground sm:block">
                        Estimativa para simulação
                      </p>
                    </div>
                  </button>
                ),
              )}

            {filteredInvestments.length ===
            0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <Search className="mx-auto size-6 text-muted-foreground" />

                <p className="mt-3 font-medium">
                  Nenhum investimento encontrado
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Tente pesquisar outro
                  nome ou código.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ===============================================
          INVESTIMENTO SELECIONADO
         =============================================== */}

      {selectedInvestment ? (
        <section className="surface p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <InvestmentIcon
              category={
                selectedInvestment.category
              }
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-semibold">
                  {
                    selectedInvestment.symbol
                  }
                </h2>

                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {
                    selectedInvestment.category
                  }
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {
                  selectedInvestment.name
                }
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {
                  selectedInvestment.description
                }
              </p>
            </div>

            <div className="rounded-xl bg-secondary p-3 text-center">
              <p className="text-xs text-muted-foreground">
                Taxa usada
              </p>

              <p className="mt-1 text-lg font-bold">
                ~
                {
                  selectedInvestment.annualRate
                }
                % a.a.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* ===============================================
          SIMULADOR
         =============================================== */}

      <section className="surface overflow-hidden">
        <div className="border-b p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <Calculator className="size-5 text-primary" />
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold">
                Simulador de investimentos
              </h2>

              <p className="text-sm text-muted-foreground">
                Veja uma projeção baseada
                nos valores informados.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-2">
          {/* CAMPOS */}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="initial-amount"
              >
                Valor inicial
              </Label>

              <Input
                id="initial-amount"
                inputMode="decimal"
                value={
                  initialAmount
                }
                onChange={(
                  event,
                ) =>
                  setInitialAmount(
                    event.target
                      .value,
                  )
                }
                className="h-11"
                placeholder="1000"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="monthly-amount"
              >
                Aporte mensal
              </Label>

              <Input
                id="monthly-amount"
                inputMode="decimal"
                value={
                  monthlyAmount
                }
                onChange={(
                  event,
                ) =>
                  setMonthlyAmount(
                    event.target
                      .value,
                  )
                }
                className="h-11"
                placeholder="500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="years">
                  Prazo em anos
                </Label>

                <Input
                  id="years"
                  type="number"
                  min="0"
                  value={years}
                  onChange={(
                    event,
                  ) =>
                    setYears(
                      event.target
                        .value,
                    )
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="annual-rate"
                >
                  Rentabilidade anual
                </Label>

                <Input
                  id="annual-rate"
                  inputMode="decimal"
                  value={
                    annualRate
                  }
                  onChange={(
                    event,
                  ) =>
                    setAnnualRate(
                      event.target
                        .value,
                    )
                  }
                  className="h-11"
                  placeholder="10"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              A simulação é apenas uma
              estimativa matemática e não
              representa garantia de
              rentabilidade.
            </p>
          </div>

          {/* RESULTADO */}

          <div className="rounded-2xl border bg-secondary/30 p-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />

              <h3 className="font-display font-semibold">
                Resultado da simulação
              </h3>
            </div>

            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                Patrimônio estimado
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight">
                {formatCurrency(
                  simulation.finalValue,
                )}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <SimulationRow
                label="Valor inicial"
                value={formatCurrency(
                  simulation.initial,
                )}
              />

              <SimulationRow
                label="Aportes mensais"
                value={formatCurrency(
                  simulation.monthly,
                )}
              />

              <SimulationRow
                label="Prazo"
                value={`${formatNumber(
                  simulation.months,
                )} meses`}
              />

              <SimulationRow
                label="Total investido"
                value={formatCurrency(
                  simulation.invested,
                )}
              />

              <SimulationRow
                label="Rendimento estimado"
                value={formatCurrency(
                  simulation.earnings,
                )}
                positive
              />
            </div>

            <div className="mt-6 border-t pt-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />

                A projeção considera
                capitalização mensal.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===============================================
          INFORMAÇÕES
         =============================================== */}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={
            <TrendingUp className="size-5" />
          }
          title="Renda variável"
          description="Ações, FIIs e ETFs podem apresentar variações de preço."
        />

        <InfoCard
          icon={
            <Landmark className="size-5" />
          }
          title="Renda fixa"
          description="Possui regras de remuneração definidas no momento da aplicação."
        />

        <InfoCard
          icon={
            <Coins className="size-5" />
          }
          title="Diversificação"
          description="Distribuir investimentos pode ajudar a reduzir concentração de risco."
        />
      </section>
    </div>
  );
}

/* =========================================================
   COMPONENTE: RESUMO
   ========================================================= */

function SummaryCard({
  icon,
  label,
  value,
  positive = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="surface p-5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary",
            positive &&
              "bg-emerald-500/10 text-emerald-600",
          )}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 truncate text-xl font-bold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTE: LINHA DA SIMULAÇÃO
   ========================================================= */

function SimulationRow({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span
        className={cn(
          "font-semibold",
          positive &&
            "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   COMPONENTE: ÍCONE DO INVESTIMENTO
   ========================================================= */

function InvestmentIcon({
  category,
}: {
  category: InvestmentCategory;
}) {
  const Icon =
    category === "Renda fixa"
      ? Landmark
      : category === "Cripto"
        ? Coins
        : category === "FIIs"
          ? Wallet
          : TrendingUp;

  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="size-5" />
    </div>
  );
}

/* =========================================================
   COMPONENTE: INFORMAÇÃO
   ========================================================= */

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="surface p-5">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="mt-4 font-display font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}