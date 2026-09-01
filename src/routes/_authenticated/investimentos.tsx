import {
  createFileRoute,
} from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  Calculator,
  Check,
  ChevronDown,
  Edit3,
  Info,
  Lightbulb,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  cn,
} from "@/lib/utils";

export const Route =
  createFileRoute(
    "/_authenticated/investimentos",
  )({
    component: InvestimentosPage,
  });

/* =========================================================
   TIPOS
   ========================================================= */

type InvestmentType =
  | "Ação"
  | "FII"
  | "Renda fixa"
  | "ETF"
  | "Criptomoeda"
  | "Tesouro Direto"
  | "Outro";

type Investment = {
  id: string;
  name: string;
  ticker: string;
  type: InvestmentType;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  institution: string;
  purchaseDate: string;
};

type SearchAsset = {
  name: string;
  ticker: string;
  type: InvestmentType;
  description: string;
};

/* =========================================================
   DADOS PARA PESQUISA

   Estes dados funcionam localmente.
   Depois podemos trocar por uma API real.
   ========================================================= */

const SEARCH_ASSETS: SearchAsset[] =
  [
    {
      name: "Petrobras PN",
      ticker: "PETR4",
      type: "Ação",
      description:
        "Ação preferencial da Petrobras, empresa brasileira do setor de energia.",
    },

    {
      name: "Vale ON",
      ticker: "VALE3",
      type: "Ação",
      description:
        "Ação da Vale, empresa brasileira do setor de mineração.",
    },

    {
      name: "Itaú Unibanco PN",
      ticker: "ITUB4",
      type: "Ação",
      description:
        "Ação preferencial do Itaú Unibanco.",
    },

    {
      name: "MXRF11",
      ticker: "MXRF11",
      type: "FII",
      description:
        "Fundo imobiliário brasileiro com exposição a diferentes ativos imobiliários.",
    },

    {
      name: "HGLG11",
      ticker: "HGLG11",
      type: "FII",
      description:
        "Fundo imobiliário com foco em imóveis logísticos.",
    },

    {
      name: "IVVB11",
      ticker: "IVVB11",
      type: "ETF",
      description:
        "ETF negociado no Brasil com exposição ao mercado de ações dos Estados Unidos.",
    },

    {
      name: "Tesouro Selic",
      ticker: "SELIC",
      type: "Tesouro Direto",
      description:
        "Título público voltado para investidores que procuram acompanhar a taxa Selic.",
    },

    {
      name: "Bitcoin",
      ticker: "BTC",
      type: "Criptomoeda",
      description:
        "Ativo digital baseado em tecnologia blockchain.",
    },

    {
      name: "Ethereum",
      ticker: "ETH",
      type: "Criptomoeda",
      description:
        "Ativo digital utilizado em aplicações baseadas em blockchain.",
    },

    {
      name: "CDB",
      ticker: "CDB",
      type: "Renda fixa",
      description:
        "Título de renda fixa emitido por instituições financeiras.",
    },
  ];

/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY =
  "finanlook-investments";

function loadInvestments(): Investment[] {
  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(
        saved,
      );

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function saveInvestments(
  investments: Investment[],
) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        investments,
      ),
    );
  } catch {
    //
  }
}

/* =========================================================
   UTILITÁRIOS
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
  ).format(
    value / 100,
  );
}

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function emptyInvestment(): Omit<
  Investment,
  "id"
> {
  return {
    name: "",
    ticker: "",
    type: "Ação",
    quantity: 0,
    averagePrice: 0,
    currentPrice: 0,
    institution: "",
    purchaseDate:
      new Date()
        .toISOString()
        .slice(0, 10),
  };
}

/* =========================================================
   PÁGINA
   ========================================================= */

function InvestimentosPage() {
  const [
    investments,
    setInvestments,
  ] =
    useState<Investment[]>([]);

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    selectedAsset,
    setSelectedAsset,
  ] =
    useState<SearchAsset | null>(
      null,
    );

  const [
    dialogOpen,
    setDialogOpen,
  ] =
    useState(false);

  const [
    editingInvestment,
    setEditingInvestment,
  ] =
    useState<Investment | null>(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState<
      Omit<
        Investment,
        "id"
      >
    >(
      emptyInvestment(),
    );

  /* =======================================================
     SIMULADOR
     ======================================================= */

  const [
    initialValue,
    setInitialValue,
  ] =
    useState(1000);

  const [
    monthlyContribution,
    setMonthlyContribution,
  ] =
    useState(500);

  const [
    annualReturn,
    setAnnualReturn,
  ] =
    useState(10);

  const [
    years,
    setYears,
  ] =
    useState(10);

  /* =======================================================
     CARREGAMENTO
     ======================================================= */

  useEffect(() => {
    setInvestments(
      loadInvestments(),
    );

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    saveInvestments(
      investments,
    );
  }, [
    investments,
    loaded,
  ]);

  /* =======================================================
     PESQUISA
     ======================================================= */

  const searchResults =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return [];
      }

      return SEARCH_ASSETS.filter(
        (asset) =>
          asset.name
            .toLowerCase()
            .includes(
              query,
            ) ||
          asset.ticker
            .toLowerCase()
            .includes(
              query,
            ) ||
          asset.type
            .toLowerCase()
            .includes(
              query,
            ),
      ).slice(
        0,
        6,
      );
    }, [
      search,
    ]);

  /* =======================================================
     CÁLCULOS DA CARTEIRA
     ======================================================= */

  const portfolio =
    useMemo(() => {
      const totalInvested =
        investments.reduce(
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
        investments.reduce(
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
        totalInvested;

      const returnPercentage =
        totalInvested > 0
          ? (profit /
              totalInvested) *
            100
          : 0;

      return {
        totalInvested,
        currentValue,
        profit,
        returnPercentage,
        assetCount:
          investments.length,
      };
    }, [
      investments,
    ]);

  /* =======================================================
     SIMULAÇÃO
     ======================================================= */

  const simulation =
    useMemo(() => {
      const safeInitial =
        Math.max(
          0,
          Number(
            initialValue,
          ) || 0,
        );

      const safeMonthly =
        Math.max(
          0,
          Number(
            monthlyContribution,
          ) || 0,
        );

      const safeAnnual =
        Math.max(
          -99,
          Number(
            annualReturn,
          ) || 0,
        );

      const safeYears =
        Math.max(
          0,
          Number(
            years,
          ) || 0,
        );

      const months =
        safeYears * 12;

      const monthlyRate =
        Math.pow(
          1 +
            safeAnnual / 100,
          1 / 12,
        ) - 1;

      let projectedValue =
        safeInitial;

      for (
        let month = 0;
        month < months;
        month++
      ) {
        projectedValue =
          projectedValue *
            (1 +
              monthlyRate) +
          safeMonthly;
      }

      const invested =
        safeInitial +
        safeMonthly *
          months;

      const earnings =
        projectedValue -
        invested;

      return {
        invested,
        projectedValue,
        earnings,
      };
    }, [
      initialValue,
      monthlyContribution,
      annualReturn,
      years,
    ]);

  /* =======================================================
     INSIGHTS
     ======================================================= */

  const insights =
    useMemo(() => {
      if (
        investments.length ===
        0
      ) {
        return [
          {
            title:
              "Sua carteira está vazia",
            description:
              "Cadastre seu primeiro investimento para começar a acompanhar sua carteira.",
            positive: true,
          },
        ];
      }

      const typeValues =
        new Map<
          InvestmentType,
          number
        >();

      investments.forEach(
        (investment) => {
          const value =
            investment.quantity *
            investment.currentPrice;

          typeValues.set(
            investment.type,
            (typeValues.get(
              investment.type,
            ) ?? 0) +
              value,
          );
        },
      );

      const largestType =
        Array.from(
          typeValues.entries(),
        ).sort(
          (a, b) =>
            b[1] -
            a[1],
        )[0];

      const typeCount =
        typeValues.size;

      const list = [
        {
          title:
            typeCount >= 3
              ? "Carteira diversificada"
              : "Diversificação",
          description:
            typeCount >= 3
              ? `Você possui investimentos distribuídos em ${typeCount} tipos diferentes.`
              : "Considere estudar diferentes classes de ativos para entender melhor a diversificação.",
          positive:
            typeCount >= 3,
        },
      ];

      if (largestType) {
        const percentage =
          portfolio.currentValue >
          0
            ? (largestType[1] /
                portfolio.currentValue) *
              100
            : 0;

        list.push({
          title:
            "Maior exposição",
          description: `${largestType[0]} representa aproximadamente ${formatPercent(
            percentage,
          )} da sua carteira.`,
          positive:
            percentage < 70,
        });
      }

      if (
        portfolio.returnPercentage >=
        0
      ) {
        list.push({
          title:
            "Evolução positiva",
          description: `Sua carteira apresenta uma variação estimada de ${formatPercent(
            portfolio.returnPercentage,
          )}.`,
          positive: true,
        });
      } else {
        list.push({
          title:
            "Variação atual",
          description: `Sua carteira apresenta uma variação estimada de ${formatPercent(
            portfolio.returnPercentage,
          )}. Oscilações podem ocorrer nos investimentos.`,
          positive: false,
        });
      }

      return list;
    }, [
      investments,
      portfolio,
    ]);

  /* =======================================================
     ADICIONAR
     ======================================================= */

  function openAddDialog(
    asset?: SearchAsset,
  ) {
    setEditingInvestment(
      null,
    );

    setForm({
      ...emptyInvestment(),

      name:
        asset?.name ??
        "",

      ticker:
        asset?.ticker ??
        "",

      type:
        asset?.type ??
        "Ação",
    });

    setDialogOpen(
      true,
    );
  }

  /* =======================================================
     EDITAR
     ======================================================= */

  function openEditDialog(
    investment: Investment,
  ) {
    setEditingInvestment(
      investment,
    );

    setForm({
      name:
        investment.name,

      ticker:
        investment.ticker,

      type:
        investment.type,

      quantity:
        investment.quantity,

      averagePrice:
        investment.averagePrice,

      currentPrice:
        investment.currentPrice,

      institution:
        investment.institution,

      purchaseDate:
        investment.purchaseDate,
    });

    setDialogOpen(
      true,
    );
  }

  /* =======================================================
     SALVAR
     ======================================================= */

  function saveInvestment() {
    const name =
      form.name.trim();

    if (!name) {
      return;
    }

    const investmentData = {
      name,

      ticker:
        form.ticker
          .trim()
          .toUpperCase(),

      type:
        form.type,

      quantity:
        Number(
          form.quantity,
        ) || 0,

      averagePrice:
        Number(
          form.averagePrice,
        ) || 0,

      currentPrice:
        Number(
          form.currentPrice,
        ) || 0,

      institution:
        form.institution.trim(),

      purchaseDate:
        form.purchaseDate,
    };

    if (
      editingInvestment
    ) {
      setInvestments(
        (
          current,
        ) =>
          current.map(
            (
              investment,
            ) =>
              investment.id ===
              editingInvestment.id
                ? {
                    id:
                      investment.id,

                    ...investmentData,
                  }
                : investment,
          ),
      );
    } else {
      setInvestments(
        (
          current,
        ) => [
          {
            id:
              createId(),

            ...investmentData,
          },

          ...current,
        ],
      );
    }

    setDialogOpen(
      false,
    );
  }

  /* =======================================================
     EXCLUIR
     ======================================================= */

  function deleteInvestment(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        "Deseja excluir este investimento?",
      );

    if (!confirmed) {
      return;
    }

    setInvestments(
      (
        current,
      ) =>
        current.filter(
          (
            investment,
          ) =>
            investment.id !==
            id,
        ),
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
         ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="size-5 text-primary" />
            </div>

            <div>
              <h1 className="font-display text-2xl font-semibold sm:text-3xl">
                Investimentos
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Acompanhe sua carteira e simule seus investimentos.
              </p>
            </div>
          </div>
        </div>

        <Button
          className="h-11"
          onClick={() =>
            openAddDialog()
          }
        >
          <Plus className="size-4" />

          Adicionar investimento
        </Button>
      </div>

      {/* =================================================
          RESUMO
         ================================================= */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            <Wallet className="size-5" />
          }
          label="Valor atual"
          value={formatCurrency(
            portfolio.currentValue,
          )}
        />

        <SummaryCard
          icon={
            <BarChart3 className="size-5" />
          }
          label="Total investido"
          value={formatCurrency(
            portfolio.totalInvested,
          )}
        />

        <SummaryCard
          icon={
            portfolio.profit >=
            0 ? (
              <TrendingUp className="size-5" />
            ) : (
              <TrendingDown className="size-5" />
            )
          }
          label="Rendimento"
          value={formatCurrency(
            portfolio.profit,
          )}
          positive={
            portfolio.profit >=
            0
          }
        />

        <SummaryCard
          icon={
            <Check className="size-5" />
          }
          label="Investimentos"
          value={String(
            portfolio.assetCount,
          )}
        />
      </section>

      {/* =================================================
          PESQUISA
         ================================================= */}

      <section className="surface p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Search className="size-5 text-primary" />
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">
              Pesquisar investimento
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Pesquise por nome, código ou tipo.
            </p>
          </div>
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

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
            placeholder="Ex.: PETR4, Bitcoin, FII..."
            className="h-11 pl-10"
          />

          {search ? (
            <button
              type="button"
              onClick={() =>
                setSearch(
                  "",
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Limpar pesquisa"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        {searchResults.length >
        0 ? (
          <div className="mt-3 divide-y rounded-xl border">
            {searchResults.map(
              (
                asset,
              ) => (
                <button
                  key={
                    asset.ticker
                  }
                  type="button"
                  onClick={() => {
                    setSelectedAsset(
                      asset,
                    );

                    setSearch(
                      "",
                    );
                  }}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {
                        asset.name
                      }
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {
                        asset.ticker
                      }{" "}
                      •{" "}
                      {
                        asset.type
                      }
                    </p>
                  </div>

                  <Info className="size-5 shrink-0 text-muted-foreground" />
                </button>
              ),
            )}
          </div>
        ) : null}

        {search &&
        searchResults.length ===
          0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhum investimento encontrado.
          </p>
        ) : null}
      </section>

      {/* =================================================
          INFORMAÇÕES DO ATIVO
         ================================================= */}

      {selectedAsset ? (
        <section className="surface overflow-hidden">
          <div className="border-b p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Info className="size-5 text-primary" />
                </div>

                <div>
                  <h2 className="font-display text-lg font-semibold">
                    {
                      selectedAsset.name
                    }
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {
                      selectedAsset.ticker
                    }{" "}
                    •{" "}
                    {
                      selectedAsset.type
                    }
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAsset(
                    null,
                  )
                }
                className="text-muted-foreground hover:text-foreground"
                aria-label="Fechar informações"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <div className="p-5">
            <p className="text-sm leading-6 text-muted-foreground">
              {
                selectedAsset.description
              }
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <InfoBox
                label="Código"
                value={
                  selectedAsset.ticker
                }
              />

              <InfoBox
                label="Categoria"
                value={
                  selectedAsset.type
                }
              />

              <InfoBox
                label="Status"
                value="Disponível para cadastro"
              />
            </div>

            <Button
              className="mt-5"
              onClick={() =>
                openAddDialog(
                  selectedAsset,
                )
              }
            >
              <Plus className="size-4" />

              Adicionar à carteira
            </Button>
          </div>
        </section>
      ) : null}

      {/* =================================================
          MINHA CARTEIRA
         ================================================= */}

      <section className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="size-5 text-primary" />
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold">
                Minha carteira
              </h2>

              <p className="text-sm text-muted-foreground">
                Seus investimentos cadastrados.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              openAddDialog()
            }
          >
            <Plus className="size-4" />

            Adicionar
          </Button>
        </div>

        {investments.length ===
        0 ? (
          <div className="p-8 text-center">
            <Wallet className="mx-auto size-10 text-muted-foreground/50" />

            <p className="mt-4 font-medium">
              Nenhum investimento cadastrado
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Adicione seu primeiro investimento para acompanhar sua carteira.
            </p>

            <Button
              className="mt-5"
              onClick={() =>
                openAddDialog()
              }
            >
              <Plus className="size-4" />

              Adicionar investimento
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {investments.map(
              (
                investment,
              ) => {
                const invested =
                  investment.quantity *
                  investment.averagePrice;

                const current =
                  investment.quantity *
                  investment.currentPrice;

                const result =
                  current -
                  invested;

                return (
                  <div
                    key={
                      investment.id
                    }
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold">
                          {
                            investment.name
                          }
                        </p>

                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                          {
                            investment.ticker ||
                            investment.type
                          }
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {
                          investment.type
                        }

                        {investment.institution
                          ? ` • ${investment.institution}`
                          : ""}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:flex sm:items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Investido
                        </p>

                        <p className="mt-1 font-medium">
                          {formatCurrency(
                            invested,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Resultado
                        </p>

                        <p
                          className={cn(
                            "mt-1 font-medium",
                            result >=
                              0
                              ? "text-success"
                              : "text-destructive",
                          )}
                        >
                          {formatCurrency(
                            result,
                          )}
                        </p>
                      </div>
                    </div>

                    {/* BOTÕES EDITAR E EXCLUIR */}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          openEditDialog(
                            investment,
                          )
                        }
                        aria-label="Editar investimento"
                      >
                        <Edit3 className="size-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          deleteInvestment(
                            investment.id,
                          )
                        }
                        className="text-destructive hover:text-destructive"
                        aria-label="Excluir investimento"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* =================================================
          SIMULADOR
         ================================================= */}

      <section className="surface p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Calculator className="size-5 text-primary" />
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">
              Simulador de investimento
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Faça uma projeção estimada com aportes mensais e rentabilidade.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="initial-value">
              Valor inicial
            </Label>

            <Input
              id="initial-value"
              type="number"
              min="0"
              value={
                initialValue
              }
              onChange={(
                event,
              ) =>
                setInitialValue(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
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
              value={
                monthlyContribution
              }
              onChange={(
                event,
              ) =>
                setMonthlyContribution(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="annual-return">
              Rentabilidade anual (%)
            </Label>

            <Input
              id="annual-return"
              type="number"
              step="0.1"
              value={
                annualReturn
              }
              onChange={(
                event,
              ) =>
                setAnnualReturn(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
            />
          </div>

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
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SimulationCard
            label="Total aportado"
            value={formatCurrency(
              simulation.invested,
            )}
          />

          <SimulationCard
            label="Rendimentos estimados"
            value={formatCurrency(
              simulation.earnings,
            )}
            positive={
              simulation.earnings >=
              0
            }
          />

          <SimulationCard
            label="Valor projetado"
            value={formatCurrency(
              simulation.projectedValue,
            )}
            highlight
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Esta simulação é apenas uma estimativa matemática baseada nos valores informados. Rentabilidades futuras não são garantidas.
        </p>
      </section>

      {/* =================================================
          INSIGHTS
         ================================================= */}

      <section className="surface p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Lightbulb className="size-5 text-primary" />
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">
              Insights da carteira
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Informações automáticas baseadas nos investimentos cadastrados.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {insights.map(
            (
              insight,
            ) => (
              <div
                key={
                  insight.title
                }
                className="rounded-xl border bg-muted/20 p-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg",
                      insight.positive
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning",
                    )}
                  >
                    <Lightbulb className="size-4" />
                  </div>

                  <p className="font-medium">
                    {
                      insight.title
                    }
                  </p>
                </div>

                <p className="mt-3 text-sm leading-5 text-muted-foreground">
                  {
                    insight.description
                  }
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      {/* =================================================
          DIALOG ADICIONAR / EDITAR
         ================================================= */}

      <Dialog
        open={dialogOpen}
        onOpenChange={
          setDialogOpen
        }
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingInvestment
                ? "Editar investimento"
                : "Adicionar investimento"}
            </DialogTitle>

            <DialogDescription>
              Informe os dados do seu investimento.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {/* NOME */}

            <div className="space-y-1.5">
              <Label htmlFor="investment-name">
                Nome do investimento
              </Label>

              <Input
                id="investment-name"
                value={
                  form.name
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      name:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="Ex.: Petrobras PN"
              />
            </div>

            {/* TICKER */}

            <div className="space-y-1.5">
              <Label htmlFor="investment-ticker">
                Código ou ticker
              </Label>

              <Input
                id="investment-ticker"
                value={
                  form.ticker
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      ticker:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="Ex.: PETR4"
              />
            </div>

            {/* TIPO */}

            <div className="space-y-1.5">
              <Label htmlFor="investment-type">
                Tipo
              </Label>

              <select
                id="investment-type"
                value={
                  form.type
                }
                onChange={(
                  event,
                ) =>
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      type:
                        event.target
                          .value as InvestmentType,
                    }),
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
                  ETF
                </option>

                <option>
                  Criptomoeda
                </option>

                <option>
                  Tesouro Direto
                </option>

                <option>
                  Outro
                </option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* QUANTIDADE */}

              <div className="space-y-1.5">
                <Label htmlFor="investment-quantity">
                  Quantidade
                </Label>

                <Input
                  id="investment-quantity"
                  type="number"
                  min="0"
                  step="any"
                  value={
                    form.quantity
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        quantity:
                          Number(
                            event.target
                              .value,
                          ),
                      }),
                    )
                  }
                />
              </div>

              {/* PREÇO MÉDIO */}

              <div className="space-y-1.5">
                <Label htmlFor="investment-average">
                  Preço médio
                </Label>

                <Input
                  id="investment-average"
                  type="number"
                  min="0"
                  step="0.01"
                  value={