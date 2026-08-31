import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Bitcoin,
  Building2,
  Landmark,
  LineChart,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute(
  "/_authenticated/investimentos",
)({
  head: () => ({
    meta: [
      {
        title: "Investimentos — FinanLook",
      },
      {
        name: "description",
        content:
          "Acompanhe sua carteira e simule seus investimentos.",
      },
    ],
  }),

  component: InvestmentsPage,
});

type InvestmentType =
  | "Ação"
  | "FII"
  | "ETF"
  | "Cripto"
  | "Renda fixa";

type Investment = {
  id: string;
  symbol: string;
  name: string;
  type: InvestmentType;
  price: number;
};

type PortfolioInvestment = {
  id: string;
  symbol: string;
  name: string;
  type: InvestmentType;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
};

const AVAILABLE_INVESTMENTS: Investment[] = [
  {
    id: "petr4",
    symbol: "PETR4",
    name: "Petrobras PN",
    type: "Ação",
    price: 38.5,
  },
  {
    id: "vale3",
    symbol: "VALE3",
    name: "Vale ON",
    type: "Ação",
    price: 55.2,
  },
  {
    id: "itub4",
    symbol: "ITUB4",
    name: "Itaú Unibanco PN",
    type: "Ação",
    price: 36.8,
  },
  {
    id: "bbas3",
    symbol: "BBAS3",
    name: "Banco do Brasil ON",
    type: "Ação",
    price: 28.4,
  },
  {
    id: "mxrf11",
    symbol: "MXRF11",
    name: "Maxi Renda",
    type: "FII",
    price: 10.2,
  },
  {
    id: "hglg11",
    symbol: "HGLG11",
    name: "CSHG Logística",
    type: "FII",
    price: 158.7,
  },
  {
    id: "xplg11",
    symbol: "XPLG11",
    name: "XP Log",
    type: "FII",
    price: 104.5,
  },
  {
    id: "bova11",
    symbol: "BOVA11",
    name: "iShares Ibovespa",
    type: "ETF",
    price: 128.6,
  },
  {
    id: "ivvb11",
    symbol: "IVVB11",
    name: "iShares S&P 500",
    type: "ETF",
    price: 395.2,
  },
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    type: "Cripto",
    price: 580000,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    type: "Cripto",
    price: 18500,
  },
];

function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    },
  ).format(
    Number.isFinite(value)
      ? value
      : 0,
  );
}

function formatPercent(
  value: number,
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function getInvestmentIcon(
  type: InvestmentType,
) {
  switch (type) {
    case "Ação":
      return <TrendingUp className="size-5" />;

    case "FII":
      return <Building2 className="size-5" />;

    case "ETF":
      return <BarChart3 className="size-5" />;

    case "Cripto":
      return <Bitcoin className="size-5" />;

    case "Renda fixa":
      return <Landmark className="size-5" />;

    default:
      return <LineChart className="size-5" />;
  }
}

function InvestmentsPage() {
  const [search, setSearch] =
    useState("");

  const [
    selectedInvestment,
    setSelectedInvestment,
  ] =
    useState<Investment | null>(
      null,
    );

  const [
    addDialogOpen,
    setAddDialogOpen,
  ] =
    useState(false);

  const [
    quantity,
    setQuantity,
  ] =
    useState("");

  const [
    averagePrice,
    setAveragePrice,
  ] =
    useState("");

  const [
    portfolio,
    setPortfolio,
  ] =
    useState<
      PortfolioInvestment[]
    >([]);

  const [
    initialValue,
    setInitialValue,
  ] =
    useState("1000");

  const [
    monthlyContribution,
    setMonthlyContribution,
  ] =
    useState("500");

  const [
    annualReturn,
    setAnnualReturn,
  ] =
    useState("10");

  const [
    years,
    setYears,
  ] =
    useState("10");

  const filteredInvestments =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return [];
      }

      return AVAILABLE_INVESTMENTS.filter(
        (investment) =>
          investment.symbol
            .toLowerCase()
            .includes(query) ||
          investment.name
            .toLowerCase()
            .includes(query) ||
          investment.type
            .toLowerCase()
            .includes(query),
      ).slice(0, 8);
    }, [search]);

  const portfolioSummary =
    useMemo(() => {
      const invested =
        portfolio.reduce(
          (
            total,
            investment,
          ) =>
            total +
            investment.quantity *
              investment.averagePrice,
          0,
        );

      const currentValue =
        portfolio.reduce(
          (
            total,
            investment,
          ) =>
            total +
            investment.quantity *
              investment.currentPrice,
          0,
        );

      const profit =
        currentValue -
        invested;

      const returnPercentage =
        invested > 0
          ? profit / invested
          : 0;

      return {
        invested,
        currentValue,
        profit,
        returnPercentage,
      };
    }, [portfolio]);

  const simulation =
    useMemo(() => {
      const initial =
        Number(initialValue) || 0;

      const contribution =
        Number(
          monthlyContribution,
        ) || 0;

      const annualRate =
        Number(annualReturn) || 0;

      const totalYears =
        Math.max(
          Number(years) || 0,
          0,
        );

      const months =
        Math.round(
          totalYears * 12,
        );

      const monthlyRate =
        Math.pow(
          1 + annualRate / 100,
          1 / 12,
        ) - 1;

      let futureValue =
        initial;

      const yearlyData: {
        year: number;
        invested: number;
        value: number;
      }[] = [];

      for (
        let month = 1;
        month <= months;
        month++
      ) {
        futureValue =
          futureValue *
            (1 + monthlyRate) +
          contribution;

        if (
          month % 12 ===
            0 ||
          month === months
        ) {
          const year =
            Math.ceil(
              month / 12,
            );

          const invested =
            initial +
            contribution *
              month;

          yearlyData.push({
            year,
            invested,
            value:
              futureValue,
          });
        }
      }

      const totalInvested =
        initial +
        contribution *
          months;

      const earnings =
        futureValue -
        totalInvested;

      return {
        futureValue,
        totalInvested,
        earnings,
        yearlyData,
      };
    }, [
      initialValue,
      monthlyContribution,
      annualReturn,
      years,
    ]);

  function openAddDialog(
    investment: Investment,
  ) {
    setSelectedInvestment(
      investment,
    );

    setQuantity("");

    setAveragePrice(
      investment.price.toString(),
    );

    setAddDialogOpen(
      true,
    );
  }

  function addInvestment() {
    if (!selectedInvestment) {
      return;
    }

    const parsedQuantity =
      Number(quantity);

    const parsedAveragePrice =
      Number(averagePrice);

    if (
      !Number.isFinite(
        parsedQuantity,
      ) ||
      parsedQuantity <= 0
    ) {
      return;
    }

    if (
      !Number.isFinite(
        parsedAveragePrice,
      ) ||
      parsedAveragePrice <= 0
    ) {
      return;
    }

    const newInvestment: PortfolioInvestment =
      {
        id:
          crypto.randomUUID(),
        symbol:
          selectedInvestment.symbol,
        name:
          selectedInvestment.name,
        type:
          selectedInvestment.type,
        quantity:
          parsedQuantity,
        averagePrice:
          parsedAveragePrice,
        currentPrice:
          selectedInvestment.price,
      };

    setPortfolio(
      (current) => [
        ...current,
        newInvestment,
      ],
    );

    setAddDialogOpen(
      false,
    );

    setSelectedInvestment(
      null,
    );

    setSearch("");
  }

  function removeInvestment(
    id: string,
  ) {
    setPortfolio(
      (current) =>
        current.filter(
          (investment) =>
            investment.id !== id,
        ),
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investimentos"
        subtitle="Acompanhe sua carteira e simule o crescimento do seu patrimônio."
      />

      {/* ===============================================
          RESUMO
         =============================================== */}

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={
            <Wallet className="size-5" />
          }
          title="Patrimônio atual"
          value={formatCurrency(
            portfolioSummary.currentValue,
          )}
        />

        <SummaryCard
          icon={
            <Landmark className="size-5" />
          }
          title="Total investido"
          value={formatCurrency(
            portfolioSummary.invested,
          )}
        />

        <SummaryCard
          icon={
            portfolioSummary.profit >=
            0 ? (
              <TrendingUp className="size-5" />
            ) : (
              <TrendingDown className="size-5" />
            )
          }
          title="Resultado"
          value={formatCurrency(
            portfolioSummary.profit,
          )}
          description={formatPercent(
            portfolioSummary.returnPercentage,
          )}
          positive={
            portfolioSummary.profit >=
            0
          }
        />
      </section>

      {/* ===============================================
          PESQUISAR INVESTIMENTO
         =============================================== */}

      <section className="surface p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Search className="size-5" />
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">
              Pesquisar investimento
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Pesquise pelo nome,
              código ou tipo do ativo.
            </p>
          </div>
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Ex.: PETR4, Bitcoin, MXRF11..."
            className="h-12 pl-10"
          />
        </div>

        {search.trim() ? (
          <div className="mt-3 overflow-hidden rounded-xl border">
            {filteredInvestments.length >
            0 ? (
              filteredInvestments.map(
                (investment) => (
                  <button
                    key={
                      investment.id
                    }
                    type="button"
                    onClick={() =>
                      openAddDialog(
                        investment,
                      )
                    }
                    className="flex w-full items-center gap-3 border-b p-4 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {getInvestmentIcon(
                        investment.type,
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        {
                          investment.symbol
                        }
                      </p>

                      <p className="truncate text-sm text-muted-foreground">
                        {
                          investment.name
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(
                          investment.price,
                        )}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {
                          investment.type
                        }
                      </p>
                    </div>
                  </button>
                ),
              )
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhum investimento
                encontrado.
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* ===============================================
          MINHA CARTEIRA
         =============================================== */}

      <section className="surface overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b p-5">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Minha carteira
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Seus investimentos
              adicionados manualmente.
            </p>
          </div>

          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wallet className="size-5" />
          </div>
        </div>

        {portfolio.length ===
        0 ? (
          <div className="p-10 text-center">
            <Wallet className="mx-auto size-10 text-muted-foreground/50" />

            <p className="mt-4 font-medium">
              Sua carteira está vazia
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Pesquise um investimento
              acima para adicioná-lo.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {portfolio.map(
              (investment) => {
                const invested =
                  investment.quantity *
                  investment.averagePrice;

                const current =
                  investment.quantity *
                  investment.currentPrice;

                const profit =
                  current -
                  invested;

                const returnPercentage =
                  invested > 0
                    ? profit /
                      invested
                    : 0;

                return (
                  <div
                    key={
                      investment.id
                    }
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {getInvestmentIcon(
                        investment.type,
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {
                            investment.symbol
                          }
                        </p>

                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          {
                            investment.type
                          }
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {
                          investment.name
                        }
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:flex sm:items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Investido
                        </p>

                        <p className="font-medium">
                          {formatCurrency(
                            invested,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Atual
                        </p>

                        <p className="font-medium">
                          {formatCurrency(
                            current,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Resultado
                        </p>

                        <p
                          className={cn(
                            "font-medium",
                            profit >= 0
                              ? "text-success"
                              : "text-destructive",
                          )}
                        >
                          {formatPercent(
                            returnPercentage,
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeInvestment(
                            investment.id,
                          )
                        }
                        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remover investimento"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* ===============================================
          SIMULADOR
         =============================================== */}

      <section className="surface overflow-hidden">
        <div className="border-b p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LineChart className="size-5" />
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold">
                Simulador de investimentos
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Simule o crescimento do seu patrimônio com aportes mensais.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>
                Valor inicial
              </Label>

              <Input
                type="number"
                min="0"
                value={
                  initialValue
                }
                onChange={(event) =>
                  setInitialValue(
                    event.target.value,
                  )
                }
                placeholder="1000"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Aporte mensal
              </Label>

              <Input
                type="number"
                min="0"
                value={
                  monthlyContribution
                }
                onChange={(event) =>
                  setMonthlyContribution(
                    event.target.value,
                  )
                }
                placeholder="500"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Rentabilidade anual (%)
              </Label>

              <Input
                type="number"
                min="0"
                step="0.1"
                value={
                  annualReturn
                }
                onChange={(event) =>
                  setAnnualReturn(
                    event.target.value,
                  )
                }
                placeholder="10"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Período em anos
              </Label>

              <Input
                type="number"
                min="0"
                value={years}
                onChange={(event) =>
                  setYears(
                    event.target.value,
                  )
                }
                placeholder="10"
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-5">
            <p className="text-sm text-muted-foreground">
              Patrimônio estimado
            </p>

            <p className="mt-2 font-display text-3xl font-bold">
              {formatCurrency(
                simulation.futureValue,
              )}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs text-muted-foreground">
                  Total investido
                </p>

                <p className="mt-1 font-semibold">
                  {formatCurrency(
                    simulation.totalInvested,
                  )}
                </p>
              </div>

              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs text-muted-foreground">
                  Rendimentos estimados
                </p>

                <p className="mt-1 font-semibold text-success">
                  {formatCurrency(
                    simulation.earnings,
                  )}
                </p>
              </div>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Esta é uma simulação
              matemática baseada na
              rentabilidade informada.
              Investimentos reais podem
              apresentar resultados
              diferentes.
            </p>
          </div>
        </div>

        {simulation.yearlyData
          .length > 0 ? (
          <div className="border-t p-5">
            <h3 className="font-display font-semibold">
              Evolução estimada
            </h3>

            <div className="mt-4 overflow-x-auto">
              <div className="min-w-[520px] overflow-hidden rounded-xl border">
                <div className="grid grid-cols-3 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
                  <span>Ano</span>

                  <span>Total investido</span>

                  <span>Patrimônio</span>
                </div>

                {simulation.yearlyData.map(
                  (item) => (
                    <div
                      key={item.year}
                      className="grid grid-cols-3 border-b px-4 py-3 text-sm last:border-b-0"
                    >
                      <span>
                        {item.year}
                      </span>

                      <span>
                        {formatCurrency(
                          item.invested,
                        )}
                      </span>

                      <span className="font-medium">
                        {formatCurrency(
                          item.value,
                        )}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* ===============================================
          DIALOG ADICIONAR
         =============================================== */}

      <Dialog
        open={addDialogOpen}
        onOpenChange={
          setAddDialogOpen
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Adicionar investimento
            </DialogTitle>

            <DialogDescription>
              {selectedInvestment
                ? `${selectedInvestment.symbol} — ${selectedInvestment.name}`
                : "Informe os dados do investimento."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">
                Preço de referência
              </p>

              <p className="mt-1 font-semibold">
                {formatCurrency(
                  selectedInvestment?.price ??
                    0,
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>
                Quantidade
              </Label>

              <Input
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    event.target.value,
                  )
                }
                placeholder="10"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Preço médio
              </Label>

              <Input
                type="number"
                min="0"
                step="0.01"
                value={
                  averagePrice
                }
                onChange={(event) =>
                  setAveragePrice(
                    event.target.value,
                  )
                }
                placeholder="0,00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={
                addInvestment
              }
            >
              <Plus className="size-4" />

              Adicionar à carteira
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  description,
  positive,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description?: string;
  positive?: boolean;
}) {
  return (
    <div className="surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 font-display text-2xl font-bold">
            {value}
          </p>

          {description ? (
            <p
              className={cn(
                "mt-1 text-sm font-medium",
                positive
                  ? "text-success"
                  : "text-destructive",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}