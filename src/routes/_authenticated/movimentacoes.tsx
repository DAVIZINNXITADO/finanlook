import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

import {
  useAccounts,
  useDeleteTransaction,
  useSaveTransaction,
  useTransactions,
  type TransactionInput,
} from "@/lib/data";

import {
  CATEGORY_EMOJI,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  formatBRL,
  formatDateBR,
  parseAmount,
  todayISO,
  type Transaction,
} from "@/lib/finance";

const searchSchema = z.object({
  tipo: z
    .enum(["entrada", "saida"])
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute(
  "/_authenticated/movimentacoes",
)({
  validateSearch: searchSchema,

  head: () => ({
    meta: [
      {
        title: "Movimentações — FinanLook",
      },
      {
        name: "description",
        content:
          "Registre, edite, filtre e organize suas entradas e saídas no FinanLook.",
      },
      {
        property: "og:title",
        content:
          "Movimentações — FinanLook",
      },
      {
        property: "og:description",
        content:
          "Suas entradas e saídas organizadas no FinanLook.",
      },
    ],
  }),

  component: TransactionsPage,
});

type FormState = {
  type: "entrada" | "saida";
  description: string;
  amount: string;
  category: string;
  date: string;
  note: string;
  account_id: string;
};

const emptyForm = (
  type: "entrada" | "saida" = "saida",
): FormState => ({
  type,
  description: "",
  amount: "",
  category: "",
  date: todayISO(),
  note: "",
  account_id: "",
});

/* =========================================================
   CLASSIFICAÇÃO AUTOMÁTICA
   ========================================================= */

type AutomaticCategory = {
  category: string;
  confidence: "alta" | "média" | "baixa";
};

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function suggestCategory(
  description: string,
  type: "entrada" | "saida",
): AutomaticCategory | null {
  const text =
    normalizeText(description);

  if (!text) {
    return null;
  }

  if (type === "entrada") {
    const rules: Array<{
      words: string[];
      category: string;
    }> = [
      {
        words: [
          "salario",
          "salário",
          "pagamento",
          "folha",
          "holerite",
          "ordenado",
        ],
        category: "Salário",
      },
      {
        words: [
          "freela",
          "freelance",
          "servico",
          "serviço",
          "trabalho",
        ],
        category: "Trabalho",
      },
      {
        words: [
          "venda",
          "vendas",
          "produto vendido",
        ],
        category: "Vendas",
      },
    ];

    for (const rule of rules) {
      if (
        rule.words.some((word) =>
          text.includes(
            normalizeText(word),
          ),
        )
      ) {
        return {
          category:
            rule.category,
          confidence: "alta",
        };
      }
    }

    return {
      category: "Outros",
      confidence: "baixa",
    };
  }

  const rules: Array<{
    words: string[];
    category: string;
  }> = [
    {
      words: [
        "uber",
        "99",
        "taxi",
        "táxi",
        "gasolina",
        "combustivel",
        "combustível",
        "onibus",
        "ônibus",
        "metro",
        "metrô",
        "estacionamento",
      ],
      category: "Transporte",
    },
    {
      words: [
        "mercado",
        "supermercado",
        "padaria",
        "restaurante",
        "almoco",
        "almoço",
        "jantar",
        "lanche",
        "ifood",
        "comida",
        "pizza",
      ],
      category: "Alimentação",
    },
    {
      words: [
        "aluguel",
        "condominio",
        "condomínio",
        "casa",
        "apartamento",
      ],
      category: "Moradia",
    },
    {
      words: [
        "luz",
        "energia",
        "agua",
        "água",
        "internet",
        "telefone",
        "celular",
        "fatura",
        "boleto",
      ],
      category: "Contas",
    },
    {
      words: [
        "farmacia",
        "farmácia",
        "remedio",
        "remédio",
        "consulta",
        "dentista",
        "medico",
        "médico",
      ],
      category: "Saúde",
    },
    {
      words: [
        "escola",
        "curso",
        "faculdade",
        "livro",
        "material",
        "aula",
      ],
      category: "Educação",
    },
    {
      words: [
        "netflix",
        "spotify",
        "prime video",
        "disney",
        "youtube premium",
        "assinatura",
      ],
      category: "Assinaturas",
    },
    {
      words: [
        "cinema",
        "jogo",
        "games",
        "show",
        "festa",
        "viagem",
        "bar",
      ],
      category: "Lazer",
    },
    {
      words: [
        "shopping",
        "roupa",
        "sapato",
        "presente",
        "eletronico",
        "eletrônico",
        "compras",
      ],
      category: "Compras",
    },
    {
      words: [
        "investimento",
        "investir",
        "acao",
        "ações",
        "fundo",
        "tesouro",
      ],
      category: "Investimentos",
    },
    {
      words: [
        "reserva",
        "emergencia",
        "emergência",
      ],
      category:
        "Reserva de emergência",
    },
    {
      words: [
        "meta",
        "objetivo",
        "viagem dos sonhos",
      ],
      category: "Metas",
    },
  ];

  for (const rule of rules) {
    if (
      rule.words.some((word) =>
        text.includes(
          normalizeText(word),
        ),
      )
    ) {
      return {
        category: rule.category,
        confidence: "alta",
      };
    }
  }

  return {
    category: "Outros",
    confidence: "baixa",
  };
}

/* =========================================================
   PÁGINA
   ========================================================= */

function TransactionsPage() {
  const navigate = useNavigate();

  const { tipo } =
    Route.useSearch();

  const {
    data: transactions = [],
    isLoading,
  } = useTransactions();

  const {
    data: accounts = [],
    isLoading: accountsLoading,
  } = useAccounts();

  const save =
    useSaveTransaction();

  const remove =
    useDeleteTransaction();

  const [open, setOpen] =
    useState(Boolean(tipo));

  const [editing, setEditing] =
    useState<Transaction | null>(
      null,
    );

  const [form, setForm] =
    useState<FormState>(() =>
      emptyForm(
        tipo ?? "saida",
      ),
    );

  const [deleting, setDeleting] =
    useState<Transaction | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const [filterType, setFilterType] =
    useState<
      "todos" | "entrada" | "saida"
    >(
      tipo === "entrada" ||
        tipo === "saida"
        ? tipo
        : "todos",
    );

  const [filterCategory, setFilterCategory] =
    useState("todas");

  const [
    automaticCategoryEnabled,
    setAutomaticCategoryEnabled,
  ] = useState(true);

  const [
    automaticSuggestion,
    setAutomaticSuggestion,
  ] = useState<
    AutomaticCategory | null
  >(null);

  const categories =
    form.type === "entrada"
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;

  const filtered =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return transactions.filter(
        (t) => {
          if (
            filterType !==
              "todos" &&
            t.type !==
              filterType
          ) {
            return false;
          }

          if (
            filterCategory !==
              "todas" &&
            t.category !==
              filterCategory
          ) {
            return false;
          }

          if (
            term &&
            !`${t.description} ${
              t.category
            } ${
              t.note ?? ""
            }`
              .toLowerCase()
              .includes(term)
          ) {
            return false;
          }

          return true;
        },
      );
    }, [
      transactions,
      search,
      filterType,
      filterCategory,
    ]);

  function closeDialog() {
    setOpen(false);
    setEditing(null);
    setAutomaticSuggestion(
      null,
    );

    navigate({
      to: "/movimentacoes",
      search: {},
      replace: true,
    });
  }

  function openNew(
    type: "entrada" | "saida" = "saida",
  ) {
    setEditing(null);

    setForm(
      emptyForm(type),
    );

    setAutomaticSuggestion(
      null,
    );

    setOpen(true);

    navigate({
      to: "/movimentacoes",
      search: { tipo: type },
      replace: true,
    });
  }

  function openEdit(
    transaction: Transaction,
  ) {
    setEditing(transaction);

    setForm({
      type:
        transaction.type ===
        "entrada"
          ? "entrada"
          : "saida",
      description:
        transaction.description,
      amount: String(
        Number(
          transaction.amount,
        ),
      ).replace(".", ","),
      category:
        transaction.category,
      date:
        transaction.date.slice(
          0,
          10,
        ),
      note:
        transaction.note ??
        "",
      account_id:
        transaction.account_id ??
        "",
    });

    setAutomaticSuggestion(
      null,
    );

    setOpen(true);
  }

  function updateDescription(
    value: string,
  ) {
    setForm(
      (previous) => ({
        ...previous,
        description:
          value,
      }),
    );

    if (
      !automaticCategoryEnabled ||
      editing
    ) {
      setAutomaticSuggestion(
        null,
      );
      return;
    }

    const suggestion =
      suggestCategory(
        value,
        form.type,
      );

    setAutomaticSuggestion(
      suggestion,
    );

    /*
     * A automação apenas sugere.
     * Se o usuário já escolheu uma categoria,
     * não sobrescrevemos a escolha dele.
     */
    if (
      suggestion &&
      !form.category
    ) {
      setForm(
        (previous) => ({
          ...previous,
          description:
            value,
          category:
            suggestion.category,
        }),
      );
    }
  }

  function applySuggestion() {
    if (
      !automaticSuggestion
    ) {
      return;
    }

    setForm(
      (previous) => ({
        ...previous,
        category:
          automaticSuggestion.category,
      }),
    );

    toast.success(
      `Categoria definida como "${automaticSuggestion.category}".`,
    );
  }

  async function submit() {
    const amount =
      parseAmount(
        form.amount,
      );

    if (
      !form.description.trim()
    ) {
      toast.error(
        "Informe uma descrição.",
      );
      return;
    }

    if (amount <= 0) {
      toast.error(
        "Informe um valor maior que zero.",
      );
      return;
    }

    if (!form.category) {
      toast.error(
        "Escolha uma categoria.",
      );
      return;
    }

    const values: TransactionInput =
      {
        type: form.type,

        description:
          form.description
            .trim()
            .slice(0, 120),

        amount,

        category:
          form.category,

        date:
          form.date,

        note:
          form.note.trim()
            ? form.note
                .trim()
                .slice(0, 300)
            : null,

        account_id:
          form.account_id ||
          null,
      };

    try {
      await save.mutateAsync(
        editing
          ? {
              id: editing.id,
              values,
            }
          : {
              values,
            },
      );

      toast.success(
        editing
          ? "Movimentação atualizada."
          : form.type ===
              "entrada"
            ? "Entrada adicionada."
            : "Gasto adicionado.",
      );

      closeDialog();
    } catch (error) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível salvar. Tente novamente.",
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) {
      return;
    }

    try {
      await remove.mutateAsync(
        deleting.id,
      );

      toast.success(
        "Movimentação excluída.",
      );
    } catch (error) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível excluir.",
      );
    }

    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimentações"
        subtitle="Tudo que entrou e saiu, do mais recente para o mais antigo."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-11"
              onClick={() =>
                openNew(
                  "entrada",
                )
              }
            >
              <Plus className="size-4" />
              Adicionar entrada
            </Button>

            <Button
              className="h-11"
              onClick={() =>
                openNew(
                  "saida",
                )
              }
            >
              <Plus className="size-4" />
              Adicionar gasto
            </Button>
          </div>
        }
      />

      <div className="surface flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            className="h-11 pl-9"
            placeholder="Pesquisar por descrição ou categoria"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value,
              )
            }
          />
        </div>

        <Select
          value={filterType}
          onValueChange={(
            value,
          ) => {
            setFilterType(
              value as
                | "todos"
                | "entrada"
                | "saida",
            );
          }}
        >
          <SelectTrigger className="h-11 sm:w-40">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="todos">
              Todos os tipos
            </SelectItem>

            <SelectItem value="entrada">
              Entradas
            </SelectItem>

            <SelectItem value="saida">
              Gastos
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={
            filterCategory
          }
          onValueChange={
            setFilterCategory
          }
        >
          <SelectTrigger className="h-11 sm:w-48">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="todas">
              Todas as categorias
            </SelectItem>

            {[
              ...new Set([
                ...INCOME_CATEGORIES,
                ...EXPENSE_CATEGORIES,
              ]),
            ].map((category) => (
              <SelectItem
                key={category}
                value={category}
              >
                {CATEGORY_EMOJI[
                  category
                ] ?? "•"}{" "}
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          Carregando...
        </p>
      ) : transactions.length ===
        0 ? (
        <EmptyState
          emoji="💳"
          title="Você ainda não possui movimentações."
          description="Adicione sua primeira entrada ou gasto para começar."
          action={
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button
                onClick={() =>
                  openNew(
                    "entrada",
                  )
                }
              >
                <Plus className="size-4" />
                Adicionar entrada
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  openNew(
                    "saida",
                  )
                }
              >
                <Plus className="size-4" />
                Adicionar gasto
              </Button>
            </div>
          }
        />
      ) : filtered.length ===
        0 ? (
        <EmptyState
          emoji="🔍"
          title="Nenhuma movimentação encontrada"
          description="Tente outro termo de pesquisa ou mude os filtros."
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map(
            (transaction) => {
              const account =
                accounts.find(
                  (item) =>
                    item.id ===
                    transaction.account_id,
                );

              return (
                <li
                  key={
                    transaction.id
                  }
                  className="surface flex items-center gap-3 p-4"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg">
                    {CATEGORY_EMOJI[
                      transaction
                        .category
                    ] ?? "•"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {
                        transaction.description
                      }
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {
                        transaction.category
                      }{" "}
                      ·{" "}
                      {formatDateBR(
                        transaction.date,
                      )}
                      {account
                        ? ` · ${account.name}`
                        : ""}
                      {transaction.is_demo
                        ? " · demonstração"
                        : ""}
                    </p>

                    {transaction.note ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {
                          transaction.note
                        }
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={
                        transaction.type ===
                        "entrada"
                          ? "text-sm font-semibold text-success"
                          : "text-sm font-semibold text-destructive"
                      }
                    >
                      {transaction.type ===
                      "entrada"
                        ? "+"
                        : "−"}{" "}
                      {formatBRL(
                        transaction.amount,
                      )}
                    </span>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar"
                        onClick={() =>
                          openEdit(
                            transaction,
                          )
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Excluir"
                        onClick={() =>
                          setDeleting(
                            transaction,
                          )
                        }
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            },
          )}
        </ul>
      )}

      {/* =====================================================
          DIALOG
          ===================================================== */}

      <Dialog
        open={open}
        onOpenChange={(
          value,
        ) => {
          if (value) {
            setOpen(true);
          } else {
            closeDialog();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? "Editar movimentação"
                : form.type ===
                    "entrada"
                  ? "Adicionar entrada"
                  : "Adicionar gasto"}
            </DialogTitle>

            <DialogDescription>
              Preencha os dados abaixo. Você pode corrigir ou editar a movimentação quando quiser.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* TIPO */}

            <div className="space-y-1.5">
              <Label>
                Tipo
              </Label>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    "entrada",
                    "saida",
                  ] as const
                ).map(
                  (type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={
                        form.type ===
                        type
                          ? "default"
                          : "outline"
                      }
                      className="h-11"
                      onClick={() => {
                        setForm(
                          (
                            previous,
                          ) => ({
                            ...previous,
                            type,
                            category:
                              "",
                          }),
                        );

                        setAutomaticSuggestion(
                          null,
                        );
                      }}
                    >
                      {type ===
                      "entrada"
                        ? "Entrada"
                        : "Gasto"}
                    </Button>
                  ),
                )}
              </div>
            </div>

            {/* DESCRIÇÃO */}

            <div className="space-y-1.5">
              <Label htmlFor="descricao">
                Descrição
              </Label>

              <Input
                id="descricao"
                className="h-11"
                placeholder={
                  form.type ===
                  "entrada"
                    ? "Salário"
                    : "Almoço"
                }
                value={
                  form.description
                }
                onChange={(e) =>
                  updateDescription(
                    e.target.value,
                  )
                }
              />
            </div>

            {/* AUTOMAÇÃO */}

            {!editing ? (
              <div className="rounded-xl border bg-accent/40 p-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
                    <Sparkles className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          Categoria automática
                        </p>

                        <p className="text-xs text-muted-foreground">
                          O FinanLook tenta identificar a categoria pela descrição.
                        </p>
                      </div>

                      <button
                        type="button"
                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                          automaticCategoryEnabled
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                        aria-label={
                          automaticCategoryEnabled
                            ? "Desativar classificação automática"
                            : "Ativar classificação automática"
                        }
                        onClick={() => {
                          setAutomaticCategoryEnabled(
                            (
                              previous,
                            ) =>
                              !previous,
                          );

                          setAutomaticSuggestion(
                            null,
                          );
                        }}
                      >
                        <span
                          className={`absolute top-1 size-4 rounded-full bg-background transition ${
                            automaticCategoryEnabled
                              ? "left-6"
                              : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    {automaticCategoryEnabled &&
                    automaticSuggestion ? (
                      <div className="mt-3 rounded-lg bg-background p-3">
                        <p className="text-xs text-muted-foreground">
                          Sugestão:
                        </p>

                        <div className="mt-1 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold">
                            {CATEGORY_EMOJI[
                              automaticSuggestion
                                .category
                            ] ??
                              "✨"}{" "}
                            {
                              automaticSuggestion.category
                            }
                          </p>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={
                              applySuggestion
                            }
                          >
                            Usar sugestão
                          </Button>
                        </div>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Confiança{" "}
                          {
                            automaticSuggestion.confidence
                          }
                          . Você pode alterar manualmente.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {/* VALOR */}

            <div className="space-y-1.5">
              <Label htmlFor="valor">
                Valor
              </Label>

              <Input
                id="valor"
                className="h-11"
                inputMode="decimal"
                placeholder="2500,00"
                value={
                  form.amount
                }
                onChange={(e) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      amount:
                        e.target
                          .value,
                    }),
                  )
                }
              />

              {form.amount ? (
                <p className="text-xs text-muted-foreground">
                  {formatBRL(
                    parseAmount(
                      form.amount,
                    ),
                  )}
                </p>
              ) : null}
            </div>

            {/* CONTA */}

            <div className="space-y-1.5">
              <Label>
                Conta
              </Label>

              <Select
                value={
                  form.account_id ||
                  "sem-conta"
                }
                onValueChange={(
                  accountId,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      account_id:
                        accountId ===
                        "sem-conta"
                          ? ""
                          : accountId,
                    }),
                  )
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Escolha a conta" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="sem-conta">
                    Sem conta vinculada
                  </SelectItem>

                  {accounts.map(
                    (account) => (
                      <SelectItem
                        key={
                          account.id
                        }
                        value={
                          account.id
                        }
                      >
                        🏦{" "}
                        {
                          account.name
                        }
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              {accountsLoading ? (
                <p className="text-xs text-muted-foreground">
                  Carregando contas...
                </p>
              ) : accounts.length ===
                0 ? (
                <p className="text-xs text-muted-foreground">
                  Você ainda não cadastrou nenhuma conta. A movimentação pode ser salva sem conta.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Vincule a movimentação à conta para que o saldo seja atualizado automaticamente.
                </p>
              )}
            </div>

            {/* CATEGORIA */}

            <div className="space-y-1.5">
              <Label>
                Categoria
              </Label>

              <Select
                value={
                  form.category
                }
                onValueChange={(
                  category,
                ) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      category,
                    }),
                  )
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Escolha uma categoria" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map(
                    (category) => (
                      <SelectItem
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {CATEGORY_EMOJI[
                          category
                        ] ??
                          "•"}{" "}
                        {category}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              {automaticCategoryEnabled &&
              form.category ? (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="size-3" />
                  Você pode corrigir a categoria manualmente a qualquer momento.
                </p>
              ) : null}
            </div>

            {/* DATA */}

            <div className="space-y-1.5">
              <Label htmlFor="data">
                Data
              </Label>

              <Input
                id="data"
                type="date"
                className="h-11"
                value={
                  form.date
                }
                onChange={(e) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      date:
                        e.target
                          .value,
                    }),
                  )
                }
              />
            </div>

            {/* OBSERVAÇÃO */}

            <div className="space-y-1.5">
              <Label htmlFor="obs">
                Observação
              </Label>

              <Textarea
                id="obs"
                placeholder="Opcional"
                value={
                  form.note
                }
                onChange={(e) =>
                  setForm(
                    (
                      previous,
                    ) => ({
                      ...previous,
                      note:
                        e.target
                          .value,
                    }),
                  )
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              onClick={() =>
                void submit()
              }
              disabled={
                save.isPending
              }
            >
              {save.isPending
                ? "Salvando..."
                : editing
                  ? "Salvar alterações"
                  : form.type ===
                      "entrada"
                    ? "Adicionar entrada"
                    : "Adicionar gasto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =====================================================
          EXCLUSÃO
          ===================================================== */}

      <AlertDialog
        open={Boolean(
          deleting,
        )}
        onOpenChange={(
          value,
        ) => {
          if (!value) {
            setDeleting(
              null,
            );
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir movimentação?
            </AlertDialogTitle>

            <AlertDialogDescription>
              {deleting
                ? `"${deleting.description}" de ${formatBRL(
                    deleting.amount,
                  )} será removida. Essa ação não pode ser desfeita.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() =>
                void confirmDelete()
              }
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}