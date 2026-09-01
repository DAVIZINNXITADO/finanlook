import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Calculator,
  ChartNoAxesCombined,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
          "Pesquise investimentos e simule possíveis rendimentos.",
      },
    ],
  }),

  component: InvestimentosPage,
});

type Investment = {
  id: string;
  name: string;
  ticker: string;
  type: string;
  rate: number;
  description: string;
};

const INVESTMENTS: Investment[] = [
  {
    id: "tesouro-selic",
    name: "Tesouro Selic",
    ticker: "SELIC",
    type: "Renda fixa",
    rate: 10.5,
    description:
      "Título público voltado para quem busca segurança e liquidez.",
  },
  {
    id: "cdb",
    name: "CDB",
    ticker: "CDB",
    type: "Renda fixa",
    rate: 11.2,
    description:
      "Investimento de renda fixa emitido por instituições financeiras.",
  },
  {
    id: "ipca",
    name: "Tesouro IPCA+",
    ticker: "IPCA",
    type: "Renda fixa",
    rate: 12.0,
    description:
      "Título que busca combinar proteção contra inflação e rentabilidade.",
  },
  {
    id: "poupanca",
    name: "Poupança",
    ticker: "POUP",
    type: "Renda fixa",
    rate: 7.0,
    description:
      "Alternativa simples e conhecida para guardar dinheiro.",
  },
  {
    id: "fundo-imobiliario",
    name: "Fundos Imobiliários",
    ticker: "FIIs",
    type: "Renda variável",
    rate: 9.0,
    description:
      "Investimentos ligados ao mercado imobiliário com renda variável.",
  },
  {
    id: "acoes",
    name: "Ações",
    ticker: "B3",
    type: "Renda variável",
    rate: 12.0,
    description:
      "Participação em empresas negociadas na bolsa de valores.",
  },
];

function InvestimentosPage() {
  const [search, setSearch] =
    useState("");

  const [selectedInvestment, setSelectedInvestment] =
    useState<Investment>(
      INVESTMENTS[0] as Investment,
    );

  const [initialValue, setInitialValue] =
    useState("1000");

  const [monthlyValue, setMonthlyValue] =
    useState("500");

  const [months, setMonths] =
    useState("12");

  const filteredInvestments =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      if (!normalizedSearch) {
        return INVESTMENTS;
      }

      return INVESTMENTS.filter(
        (investment) =>
          investment.name
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          investment.ticker
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          investment.type
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
      );
    }, [search]);

  const simulation =
    useMemo(() => {
      const initial =
        Number(
          initialValue.replace(
            ",",
            ".",
          ),
        ) || 0;

      const monthly =
        Number(
          monthlyValue.replace(
            ",",
            ".",
          ),
        ) || 0;

      const totalMonths =
        Math.max(
          0,
          Math.floor(
            Number(months) || 0,
          ),
        );

      const monthlyRate =
        Math.pow(
          1 +
            selectedInvestment.rate /
              100,
          1 / 12,
        ) - 1;

      let total =
        initial;

      for (
        let month = 0;
        month < totalMonths;
        month += 1
      ) {
        total =
          total *
            (1 +
              monthlyRate) +
          monthly;
      }

      const invested =
        initial +
        monthly * totalMonths;

      const earnings =
        Math.max(
          0,
          total - invested,
        );

      return {
        invested,
        total,
        earnings,
      };
    }, [
      initialValue,
      monthlyValue,
      months,
      selectedInvestment,
    ]);

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

  function selectInvestment(
    investment: Investment,
  ) {
    setSelectedInvestment(
      investment,
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investimentos"
        subtitle="Pesquise opções e simule possíveis rendimentos para seus investimentos."
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* PESQUISA */}

        <div className="surface overflow-hidden">
          <div className="border-b p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <Search className="size-5 text-primary" />
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold">
                  Pesquisar investimento
                </h2>

                <p className="text-sm text-muted-foreground">
                  Encontre uma opção para simular.
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
                className="h-11 pl-10"
                placeholder="Ex.: CDB, Tesouro ou ações"
              />
            </div>
          </div>

          <div className="max-h-[420px] divide-y overflow-y-auto">
            {filteredInvestments.length >
            0 ? (
              filteredInvestments.map(
                (investment) => {
                  const active =
                    selectedInvestment.id ===
                    investment.id;

                  return (
                    <button
                      key={
                        investment.id
                      }
                      type="button"
                      onClick={() =>
                        selectInvestment(
                          investment,
                        )
                      }
                      className={
                        active
                          ? "w-full bg-primary/10 p-5 text-left transition-colors"
                          : "w-full p-5 text-left transition-colors hover:bg-muted/50"
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium">
                            {
                              investment.name
                            }
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {
                              investment.description
                            }
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                          {
                            investment.ticker
                          }
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {
                            investment.type
                          }
                        </span>

                        <span className="font-medium text-primary">
                          {
                            investment.rate
                          }
                          % ao ano
                        </span>
                      </div>
                    </button>
                  );
                },
              )
            ) : (
              <div className="p-8 text-center">
                <Search className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-3 font-medium">
                  Nenhum investimento encontrado
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Tente pesquisar por outro nome.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SIMULADOR */}

        <div className="surface overflow-hidden">
          <div className="border-b p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <Calculator className="size-5 text-primary" />
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold">
                  Simulador
                </h2>

                <p className="text-sm text-muted-foreground">
                  Faça uma estimativa baseada no investimento selecionado.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5">
            {/* INVESTIMENTO SELECIONADO */}

            <div className="rounded-xl border bg-secondary/30 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Investimento selecionado
                  </p>

                  <p className="mt-1 font-display text-lg font-semibold">
                    {
                      selectedInvestment.name
                    }
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {
                      selectedInvestment.type
                    }
                  </p>
                </div>

                <TrendingUp className="size-6 text-primary" />
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Taxa usada na simulação
                </p>

                <p className="mt-1 text-xl font-semibold text-primary">
                  {
                    selectedInvestment.rate
                  }
                  % ao ano
                </p>
              </div>
            </div>

            {/* VALOR INICIAL */}

            <div className="space-y-1.5">
              <Label htmlFor="initial-value">
                Valor inicial
              </Label>

              <Input
                id="initial-value"
                inputMode="decimal"
                className="h-11"
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

            {/* APORTE */}

            <div className="space-y-1.5">
              <Label htmlFor="monthly-value">
                Aporte mensal
              </Label>

              <Input
                id="monthly-value"
                inputMode="decimal"
                className="h-11"
                value={
                  monthlyValue
                }
                onChange={(event) =>
                  setMonthlyValue(
                    event.target.value,
                  )
                }
                placeholder="500"
              />
            </div>

            {/* PRAZO */}

            <div className="space-y-1.5">
              <Label htmlFor="months">
                Prazo em meses
              </Label>

              <Input
                id="months"
                type="number"
                min="0"
                className="h-11"
                value={months}
                onChange={(event) =>
                  setMonths(
                    event.target.value,
                  )
                }
                placeholder="12"
              />
            </div>

            <Button
              type="button"
              className="h-11 w-full"
            >
              <ChartNoAxesCombined className="size-4" />

              Simulação atualizada
            </Button>
          </div>
        </div>
      </section>

      {/* RESULTADOS */}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="size-5 text-primary" />
            </div>

            <p className="text-sm text-muted-foreground">
              Total investido
            </p>
          </div>

          <p className="mt-5 text-2xl font-bold">
            {formatCurrency(
              simulation.invested,
            )}
          </p>
        </div>

        <div className="surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="size-5 text-primary" />
            </div>

            <p className="text-sm text-muted-foreground">
              Rendimentos estimados
            </p>
          </div>

          <p className="mt-5 text-2xl font-bold text-primary">
            {formatCurrency(
              simulation.earnings,
            )}
          </p>
        </div>

        <div className="surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <ChartNoAxesCombined className="size-5 text-primary" />
            </div>

            <p className="text-sm text-muted-foreground">
              Valor estimado
            </p>
          </div>

          <p className="mt-5 text-2xl font-bold">
            {formatCurrency(
              simulation.total,
            )}
          </p>
        </div>
      </section>

      <p className="px-1 text-center text-xs text-muted-foreground">
        Esta simulação é apenas uma estimativa e não representa garantia de rentabilidade.
      </p>
    </div>
  );
}