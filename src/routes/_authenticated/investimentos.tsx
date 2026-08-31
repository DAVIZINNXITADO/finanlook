import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  AlertTriangle,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Landmark,
  Plus,
  Search,
  ShieldAlert,
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
          "Simule, registre e acompanhe seus investimentos no FinanLook.",
      },
    ],
  }),

  component: InvestmentsPage,
});

type InvestmentType =
  | "Ação"
  | "FII"
  | "Renda fixa"
  | "Criptomoeda"
  | "ETF"
  | "Outro";

type RegisteredInvestment = {
  id: string;
  name: string;
  type: InvestmentType;
  investedValue: number;
  currentValue: number;
  date: string;
};

const SEARCH_SUGGESTIONS = [
  {
    name: "Tesouro Selic",
    code: "Renda fixa",
    type: "Renda fixa" as InvestmentType,
    risk: "Baixo",
    signal: "positive",
  },
  {
    name: "PETR4",
    code: "Petrobras PN",
    type: "Ação" as InvestmentType,
    risk: "Alto",
    signal: "attention",
  },
  {
    name: "VALE3",
    code: "Vale ON",
    type: "Ação" as InvestmentType,
    risk: "Alto",
    signal: "attention",
  },
  {
    name: "MXRF11",
    code: "Fundo imobiliário",
    type: "FII" as InvestmentType,
    risk: "Médio",
    signal: "attention",
  },
  {
    name: "Bitcoin",
    code: "BTC",
    type: "Criptomoeda" as InvestmentType,
    risk: "Muito alto",
    signal: "risk",
  },
  {
    name: "IVVB11",
    code: "ETF internacional",
    type: "ETF" as InvestmentType,
    risk: "Alto",
    signal: "attention",
  },
];

function InvestmentsPage() {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    selectedInvestment,
    setSelectedInvestment,
  ] =
    useState<
      (typeof SEARCH_SUGGESTIONS)[number] | null
    >(null);

  const [
    simulatorOpen,
    setSimulatorOpen,
  ] =
    useState(false);

  const [
    registerOpen,
    setRegisterOpen,
  ] =
    useState(false);

  const [
    initialValue,
    setInitialValue,
  ] =
    useState("");

  const [
    monthlyContribution,
    setMonthlyContribution,
  ] =
    useState("");

  const [
    duration,
    setDuration,
  ] =
    useState("");

  const [
    annualRate,
    setAnnualRate,
  ] =
    useState("");

  const [
    simulationStarted,
    setSimulationStarted,
  ] =
    useState(false);

  const [
    investmentName,
    setInvestmentName,
  ] =
    useState("");

  const [
    investmentType,
    setInvestmentType,
  ] =
    useState<InvestmentType>(
      "Outro",
    );

  const [
    investedValue,
    setInvestedValue,
  ] =
    useState("");

  const [
    currentValue,
    setCurrentValue,
  ] =
    useState("");

  const [
    investmentDate,
    setInvestmentDate,
  ] =
    useState("");

  const [
    investments,
    setInvestments,
  ] =
    useState<
      RegisteredInvestment[]
    >([]);

  const filteredInvestments =
    useMemo(() => {
      const normalized =
        search
          .trim()
          .toLowerCase();

      if (!normalized) {
        return SEARCH_SUGGESTIONS;
      }

      return SEARCH_SUGGESTIONS.filter(
        (investment) =>
          investment.name
            .toLowerCase()
            .includes(
              normalized,
            ) ||
          investment.code
            .toLowerCase()
            .includes(
              normalized,
            ),
      );
    }, [
      search,
    ]);

  const simulation =
    useMemo(() => {
      const initial =
        Number(
          initialValue,
        ) || 0;

      const monthly =
        Number(
          monthlyContribution,
        ) || 0;

      const months =
        Number(
          duration,
        ) || 0;

      const annual =
        Number(
          annualRate,
        ) || 0;

      if (
        initial <= 0 ||
        months <= 0
      ) {
        return null;
      }

      const monthlyRate =
        Math.pow(
          1 +
            annual /
              100,
          1 / 12,
        ) -
        1;

      let total =
        initial;

      for (
        let month = 0;
        month < months;
        month += 1
      ) {
        total =
          total *
            (
              1 +
              monthlyRate
            ) +
          monthly;
      }

      const totalInvested =
        initial +
        monthly *
          months;

      const earnings =
        total -
        totalInvested;

      return {
        total,
        totalInvested,
        earnings,
        months,
      };
    }, [
      initialValue,
      monthlyContribution,
      duration,
      annualRate,
    ]);

  function formatCurrency(
    value: number,
  ) {
    return new Intl.NumberFormat(
      "pt-BR",
      {
        style:
          "currency",
        currency:
          "BRL",
      },
    ).format(
      Number.isFinite(
        value,
      )
        ? value
        : 0,
    );
  }

  function openSimulator() {
    setInitialValue("");
    setMonthlyContribution("");
    setDuration("");
    setAnnualRate("");
    setSimulationStarted(
      false,
    );

    setSimulatorOpen(
      true,
    );
  }

  function openRegister() {
    setInvestmentName("");
    setInvestmentType(
      "Outro",
    );
    setInvestedValue("");
    setCurrentValue("");
    setInvestmentDate("");

    setRegisterOpen(
      true,
    );
  }

  function runSimulation() {
    setSimulationStarted(
      true,
    );
  }

  function registerInvestment() {
    const invested =
      Number(
        investedValue,
      );

    const current =
      Number(
        currentValue,
      );

    if (
      !investmentName.trim() ||
      invested <= 0
    ) {
      return;
    }

    const investment:
      RegisteredInvestment =
      {
        id:
          crypto.randomUUID(),
        name:
          investmentName.trim(),
        type:
          investmentType,
        investedValue:
          invested,
        currentValue:
          current > 0
            ? current
            : invested,
        date:
          investmentDate ||
          new Date()
            .toISOString()
            .slice(
              0,
              10,
            ),
      };

    setInvestments(
      (
        currentInvestments,
      ) => [
        investment,
        ...currentInvestments,
      ],
    );

    setRegisterOpen(
      false,
    );
  }

  function removeInvestment(
    id: string,
  ) {
    setInvestments(
      (
        currentInvestments,
      ) =>
        currentInvestments.filter(
          (
            investment,
          ) =>
            investment.id !==
            id,
        ),
    );
  }

  const totalInvested =
    investments.reduce(
      (
        total,
        investment,
      ) =>
        total +
        investment.investedValue,
      0,
    );

  const totalCurrent =
    investments.reduce(
      (
        total,
        investment,
      ) =>
        total +
        investment.currentValue,
      0,
    );

  const totalResult =
    totalCurrent -
    totalInvested;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investimentos"
        subtitle="Simule investimentos, registre sua carteira e acompanhe informações importantes."
      />

      {/* ===============================================
          RESUMO
         =============================================== */}

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Total investido"
          value={formatCurrency(
            totalInvested,
          )}
          icon={
            <Wallet className="size-5" />
          }
        />

        <SummaryCard
          title="Valor atual"
          value={formatCurrency(
            totalCurrent,
          )}
          icon={
            <CircleDollarSign className="size-5" />
          }
        />

        <SummaryCard
          title="Resultado"
          value={formatCurrency(
            totalResult,
          )}
          icon={
            totalResult >= 0 ? (
              <TrendingUp className="size-5" />
            ) : (
              <TrendingDown className="size-5" />
            )
          }
          positive={
            totalResult >= 0
          }
          negative={
            totalResult < 0
          }
        />
      </section>

      {/* ===============================================
          AÇÕES
         =============================================== */}

      <section className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={
            openSimulator
          }
          className="surface group p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="size-6" />
            </div>

            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold">
                Simular investimento
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Informe um valor, aportes,
                duração e uma rentabilidade
                estimada para visualizar uma
                projeção.
              </p>

              <span className="mt-4 inline-flex text-sm font-medium text-primary">
                Criar simulação →
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={
            openRegister
          }
          className="surface group p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Plus className="size-6" />
            </div>

            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold">
                Registrar investimento
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Adicione investimentos que
                você já possui para acompanhar
                sua carteira.
              </p>

              <span className="mt-4 inline-flex text-sm font-medium text-primary">
                Adicionar investimento →
              </span>
            </div>
          </div>
        </button>
      </section>

      {/* ===============================================
          PESQUISA
         =============================================== */}

      <section className="surface p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Search className="size-5" />
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">
              Pesquisar investimento
            </h2>

            <p className="text-sm text-muted-foreground">
              Pesquise por nome ou código do
              investimento.
            </p>
          </div>
        </div>

        <div className="relative mt-5">
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
            placeholder="Ex.: PETR4, Bitcoin, Tesouro Selic..."
            className="h-12 pl-10"
          />
        </div>

        <div className="mt-4 grid gap-2">
          {filteredInvestments.map(
            (
              investment,
            ) => (
              <button
                key={
                  investment.name
                }
                type="button"
                onClick={() =>
                  setSelectedInvestment(
                    investment,
                  )
                }
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors hover:bg-muted/50",

                  selectedInvestment?.name ===
                    investment.name &&
                    "border-primary bg-primary/5",
                )}
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {
                      investment.name
                    }
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {
                      investment.code
                    }
                  </p>
                </div>

                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  {
                    investment.type
                  }
                </span>
              </button>
            ),
          )}

          {filteredInvestments.length ===
          0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum investimento encontrado.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ===============================================
          ANÁLISE
         =============================================== */}

      {selectedInvestment ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Análise do investimento
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Informações gerais para ajudar
              você a entender melhor o ativo.
            </p>
          </div>

          <div className="surface overflow-hidden">
            <div className="border-b p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-semibold">
                    {
                      selectedInvestment.name
                    }
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {
                      selectedInvestment.code
                    }
                  </p>
                </div>

                <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">
                  {
                    selectedInvestment.type
                  }
                </span>
              </div>
            </div>

            <div className="grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
              <InfoItem
                icon={
                  <BarChart3 className="size-5" />
                }
                label="Tipo"
                value={
                  selectedInvestment.type
                }
              />

              <InfoItem
                icon={
                  <ShieldAlert className="size-5" />
                }
                label="Risco estimado"
                value={
                  selectedInvestment.risk
                }
              />

              <InfoItem
                icon={
                  <TrendingUp className="size-5" />
                }
                label="Status"
                value="Em análise"
              />
            </div>
          </div>

          {/* =============================================
              INSIGHT
             ============================================= */}

          <div className="surface overflow-hidden">
            <div className="border-b p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Brain className="size-5" />
                </div>

                <div>
                  <h2 className="font-display text-lg font-semibold">
                    Insight FinanLook
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Análise informativa baseada
                    nas características gerais
                    do investimento.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <InvestmentInsight
                signal={
                  selectedInvestment.signal
                }
                name={
                  selectedInvestment.name
                }
                risk={
                  selectedInvestment.risk
                }
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* ===============================================
          CARTEIRA
         =============================================== */}

      <section className="surface overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b p-5">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Minha carteira
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Investimentos registrados por
              você.
            </p>
          </div>

          <Button
            size="sm"
            onClick={
              openRegister
            }
          >
            <Plus className="size-4" />

            Adicionar
          </Button>
        </div>

        {investments.length ===
        0 ? (
          <div className="p-8 text-center">
            <Landmark className="mx-auto size-10 text-muted-foreground" />

            <h3 className="mt-4 font-medium">
              Nenhum investimento registrado
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Registre seus investimentos
              para acompanhar sua carteira
              aqui.
            </p>

            <Button
              className="mt-5"
              onClick={
                openRegister
              }
            >
              <Plus className="size-4" />

              Registrar investimento
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {investments.map(
              (
                investment,
              ) => {
                const result =
                  investment.currentValue -
                  investment.investedValue;

                return (
                  <div
                    key={
                      investment.id
                    }
                    className="flex items-center gap-4 p-5"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <TrendingUp className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {
                          investment.name
                        }
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {
                          investment.type
                        }
                      </p>
                    </div>

                    <div className="hidden text-right sm:block">
                      <p className="font-medium">
                        {formatCurrency(
                          investment.currentValue,
                        )}
                      </p>

                      <p
                        className={cn(
                          "mt-1 text-xs",

                          result >=
                            0
                            ? "text-emerald-600"
                            : "text-destructive",
                        )}
                      >
                        {result >=
                        0
                          ? "+"
                          : ""}
                        {formatCurrency(
                          result,
                        )}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        removeInvestment(
                          investment.id,
                        )
                      }
                      aria-label="Remover investimento"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* ===============================================
          AVISO
         =============================================== */}

      <section className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-600" />

          <div>
            <h2 className="font-medium">
              Aviso sobre investimentos
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Investimentos podem valorizar ou
              desvalorizar. Simulações e
              informações apresentadas pelo
              FinanLook são apenas
              informativas e educacionais e
              não representam garantia de
              rentabilidade ou recomendação
              individual de investimento.
            </p>
          </div>
        </div>
      </section>

      {/* ===============================================
          DIALOG SIMULAÇÃO
         =============================================== */}

      <Dialog
        open={simulatorOpen}
        onOpenChange={
          setSimulatorOpen
        }
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Simular investimento
            </DialogTitle>

            <DialogDescription>
              Informe os dados abaixo para
              criar uma projeção.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="initial-value">
                Valor inicial
              </Label>

              <Input
                id="initial-value"
                type="number"
                min="0"
                step="0.01"
                value={
                  initialValue
                }
                onChange={(
                  event,
                ) =>
                  setInitialValue(
                    event.target
                      .value,
                  )
                }
                placeholder="Ex.: 1000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="monthly-contribution">
                Aporte mensal
              </Label>

              <Input
                id="monthly-contribution"
                type="number"
                min="0"
                step="0.01"
                value={
                  monthlyContribution
                }
                onChange={(
                  event,
                ) =>
                  setMonthlyContribution(
                    event.target
                      .value,
                  )
                }
                placeholder="Ex.: 500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duration">
                Duração em meses
              </Label>

              <Input
                id="duration"
                type="number"
                min="1"
                value={
                  duration
                }
                onChange={(
                  event,
                ) =>
                  setDuration(
                    event.target
                      .value,
                  )
                }
                placeholder="Ex.: 60"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="annual-rate">
                Rentabilidade anual estimada (%)
              </Label>

              <Input
                id="annual-rate"
                type="number"
                min="0"
                step="0.01"
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
                placeholder="Ex.: 10"
              />
            </div>

            {simulationStarted &&
            simulation ? (
              <div className="rounded-xl bg-primary/10 p-4">
                <p className="text-sm text-muted-foreground">
                  Valor estimado ao final
                </p>

                <p className="mt-1 font-display text-2xl font-semibold text-primary">
                  {formatCurrency(
                    simulation.total,
                  )}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      Total investido
                    </p>

                    <p className="mt-1 font-medium">
                      {formatCurrency(
                        simulation.totalInvested,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">
                      Rendimento estimado
                    </p>

                    <p className="mt-1 font-medium text-emerald-600">
                      +
                      {formatCurrency(
                        simulation.earnings,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={
                runSimulation
              }
              disabled={
                !initialValue ||
                !duration
              }
            >
              <TrendingUp className="size-4" />

              Simular investimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===============================================
          DIALOG REGISTRAR
         =============================================== */}

      <Dialog
        open={registerOpen}
        onOpenChange={
          setRegisterOpen
        }
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Registrar investimento
            </DialogTitle>

            <DialogDescription>
              Adicione um investimento que
              você já possui.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="investment-name">
                Nome do investimento
              </Label>

              <Input
                id="investment-name"
                value={
                  investmentName
                }
                onChange={(
                  event,
                ) =>
                  setInvestmentName(
                    event.target
                      .value,
                  )
                }
                placeholder="Ex.: Tesouro Selic"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="investment-type">
                Tipo
              </Label>

              <select
                id="investment-type"
                value={
                  investmentType
                }
                onChange={(
                  event,
                ) =>
                  setInvestmentType(
                    event.target
                      .value as InvestmentType,
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option>
                  Ação
                </option>

                <option>
                  FII
                </option>

                <option>
                  Renda fixa
                </option>

                <option>
                  Criptomoeda
                </option>

                <option>
                  ETF
                </option>

                <option>
                  Outro
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invested-value">
                Valor investido
              </Label>

              <Input
                id="invested-value"
                type="number"
                min="0"
                step="0.01"
                value={
                  investedValue
                }
                onChange={(
                  event,
                ) =>
                  setInvestedValue(
                    event.target
                      .value,
                  )
                }
                placeholder="Ex.: 5000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="current-value">
                Valor atual
              </Label>

              <Input
                id="current-value"
                type="number"
                min="0"
                step="0.01"
                value={
                  currentValue
                }
                onChange={(
                  event,
                ) =>
                  setCurrentValue(
                    event.target
                      .value,
                  )
                }
                placeholder="Opcional"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="investment-date">
                Data do investimento
              </Label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="investment-date"
                  type="date"
                  className="pl-10"
                  value={
                    investmentDate
                  }
                  onChange={(
                    event,
                  ) =>
                    setInvestmentDate(
                      event.target
                        .value,
                    )
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              disabled={
                !investmentName.trim() ||
                !investedValue ||
                Number(
                  investedValue,
                ) <= 0
              }
              onClick={
                registerInvestment
              }
            >
              <CheckCircle2 className="size-4" />

              Registrar investimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================
   COMPONENTE: CARD DE RESUMO
   ========================================================= */

function SummaryCard({
  title,
  value,
  icon,
  positive = false,
  negative = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {title}
        </p>

        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary",

            positive &&
              "bg-emerald-500/10 text-emerald-600",

            negative &&
              "bg-destructive/10 text-destructive",
          )}
        >
          {icon}
        </div>
      </div>

      <p
        className={cn(
          "mt-3 font-display text-2xl font-semibold",

          positive &&
            "text-emerald-600",

          negative &&
            "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   COMPONENTE: INFORMAÇÃO
   ========================================================= */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}

        <span className="text-sm">
          {label}
        </span>
      </div>

      <p className="mt-3 font-medium">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   COMPONENTE: INSIGHT
   ========================================================= */

function InvestmentInsight({
  signal,
  name,
  risk,
}: {
  signal:
    | "positive"
    | "attention"
    | "risk";

  name: string;
  risk: string;
}) {
  if (
    signal ===
    "positive"
  ) {
    return (
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="size-4" />

          Sinais positivos
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          {name} possui características
          geralmente associadas a uma opção
          de menor volatilidade em comparação
          com investimentos de maior risco.
          Ainda assim, condições de mercado,
          inflação e taxas podem influenciar
          os resultados.
        </p>

        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-sm font-medium">
            Pontos de atenção
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Analise prazo, liquidez e
            rentabilidade antes de investir.
          </p>
        </div>
      </div>
    );
  }

  if (
    signal ===
    "risk"
  ) {
    return (
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive">
          <AlertTriangle className="size-4" />

          Alta volatilidade
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          {name} apresenta um nível de risco
          estimado como {risk.toLowerCase()}.
          Isso significa que o valor pode
          apresentar variações significativas
          em períodos curtos.
        </p>

        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-sm font-medium">
            Pontos de atenção
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Considere seu perfil de risco,
            horizonte de investimento e
            diversificação da carteira.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1.5 text-sm font-medium text-yellow-700">
        <AlertTriangle className="size-4" />

        Atenção e análise necessária
      </div>

      <p className="text-sm leading-6 text-muted-foreground">
        {name} pode apresentar oportunidades
        e riscos dependendo do cenário
        econômico e das características do
        ativo. Não é possível garantir que
        o investimento irá valorizar.
      </p>

      <div className="rounded-xl bg-muted/50 p-4">
        <p className="text-sm font-medium">
          Insight FinanLook
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Avalie indicadores, histórico,
          riscos e seu objetivo financeiro
          antes de tomar uma decisão.
        </p>
      </div>
    </div>
  );
}