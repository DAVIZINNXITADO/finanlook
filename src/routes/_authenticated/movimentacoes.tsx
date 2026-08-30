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
          "Registre, edite, filtre e pesquise suas entradas e saídas de dinheiro no FinanLook.",
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
});

function TransactionsPage() {
  const navigate = useNavigate();
  const { tipo } = Route.useSearch();

  const {
    data: transactions = [],
    isLoading,
  } = useTransactions();

  const save = useSaveTransaction();
  const remove = useDeleteTransaction();

  const [open, setOpen] = useState(
    Boolean(tipo),
  );

  const [editing, setEditing] =
    useState<Transaction | null>(null);

  const [form, setForm] = useState<FormState>(
    () => emptyForm(tipo ?? "saida"),
  );

  const [deleting, setDeleting] =
    useState<Transaction | null>(null);

  const [search, setSearch] =
    useState("");

  const [filterType, setFilterType] =
    useState(
      tipo === "entrada" ||
        tipo === "saida"
        ? tipo
        : "todos",
    );

  const [filterCategory, setFilterCategory] =
    useState("todas");

  const categories =
    form.type === "entrada"
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;

  const filtered = useMemo(() => {
    const term =
      search.trim().toLowerCase();

    return transactions.filter((t) => {
      if (
        filterType !== "todos" &&
        t.type !== filterType
      ) {
        return false;
      }

      if (
        filterCategory !== "todas" &&
        t.category !== filterCategory
      ) {
        return false;
      }

      if (
        term &&
        !`${t.description} ${
          t.category
        } ${t.note ?? ""}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }

      return true;
    });
  }, [
    transactions,
    search,
    filterType,
    filterCategory,
  ]);

  function closeDialog() {
    setOpen(false);

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
    setForm(emptyForm(type));
    setOpen(true);

    navigate({
      to: "/movimentacoes",
      search: { tipo: type },
      replace: true,
    });
  }

  function openEdit(t: Transaction) {
    setEditing(t);

    setForm({
      type:
        t.type === "entrada"
          ? "entrada"
          : "saida",
      description: t.description,
      amount: String(
        Number(t.amount),
      ).replace(".", ","),
      category: t.category,
      date: t.date.slice(0, 10),
      note: t.note ?? "",
    });

    setOpen(true);
  }

  async function submit() {
    const amount = parseAmount(
      form.amount,
    );

    if (!form.description.trim()) {
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

    const values: TransactionInput = {
      type: form.type,
      description:
        form.description
          .trim()
          .slice(0, 120),
      amount,
      category: form.category,
      date: form.date,
      note: form.note.trim()
        ? form.note
            .trim()
            .slice(0, 300)
        : null,
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
          : form.type === "entrada"
            ? "Entrada adicionada."
            : "Gasto adicionado.",
      );

      closeDialog();
    } catch {
      toast.error(
        "Não foi possível salvar. Tente novamente.",
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) return;

    try {
      await remove.mutateAsync(
        deleting.id,
      );

      toast.success(
        "Movimentação excluída.",
      );
    } catch {
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
                openNew("entrada")
              }
            >
              <Plus className="size-4" />
              Adicionar entrada
            </Button>

            <Button
              className="h-11"
              onClick={() =>
                openNew("saida")
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
              setSearch(e.target.value)
            }
          />
        </div>

        <Select
          value={filterType}
          onValueChange={(
            value,
          ) => {
            setFilterType(value);

            if (
              value === "entrada" ||
              value === "saida"
            ) {
              setForm((previous) => ({
                ...previous,
                type: value,
                category: "",
              }));
            }
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
          value={filterCategory}
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
            ].map((c) => (
              <SelectItem
                key={c}
                value={c}
              >
                {CATEGORY_EMOJI[c] ??
                  "•"}{" "}
                {c}
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
                  openNew("entrada")
                }
              >
                <Plus className="size-4" />
                Adicionar entrada
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  openNew("saida")
                }
              >
                <Plus className="size-4" />
                Adicionar gasto
              </Button>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="Nenhuma movimentação encontrada"
          description="Tente outro termo de pesquisa ou mude os filtros."
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((t) => (
            <li
              key={t.id}
              className="surface flex items-center gap-3 p-4"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg">
                {CATEGORY_EMOJI[
                  t.category
                ] ?? "•"}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {t.description}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {t.category} ·{" "}
                  {formatDateBR(t.date)}
                  {t.is_demo
                    ? " · demonstração"
                    : ""}
                </p>

                {t.note ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {t.note}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={
                    t.type ===
                    "entrada"
                      ? "text-sm font-semibold text-success"
                      : "text-sm font-semibold text-destructive"
                  }
                >
                  {t.type ===
                  "entrada"
                    ? "+"
                    : "−"}{" "}
                  {formatBRL(t.amount)}
                </span>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar"
                    onClick={() =>
                      openEdit(t)
                    }
                  >
                    <Pencil className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir"
                    onClick={() =>
                      setDeleting(t)
                    }
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={open}
        onOpenChange={(value) => {
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
              Preencha os dados abaixo. Você
              pode editar depois.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    "entrada",
                    "saida",
                  ] as const
                ).map((type) => (
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
                    onClick={() =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          type,
                          category: "",
                        }),
                      )
                    }
                  >
                    {type ===
                    "entrada"
                      ? "Entrada"
                      : "Gasto"}
                  </Button>
                ))}
              </div>
            </div>

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
                  setForm(
                    (previous) => ({
                      ...previous,
                      description:
                        e.target
                          .value,
                    }),
                  )
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="valor">
                Valor
              </Label>

              <Input
                id="valor"
                className="h-11"
                inputMode="decimal"
                placeholder="2500,00"
                value={form.amount}
                onChange={(e) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      amount:
                        e.target.value,
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

            <div className="space-y-1.5">
              <Label>
                Categoria
              </Label>

              <Select
                value={form.category}
                onValueChange={(
                  category,
                ) =>
                  setForm(
                    (previous) => ({
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
                    (c) => (
                      <SelectItem
                        key={c}
                        value={c}
                      >
                        {CATEGORY_EMOJI[
                          c
                        ] ??
                          "•"}{" "}
                        {c}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data">
                Data
              </Label>

              <Input
                id="data"
                type="date"
                className="h-11"
                value={form.date}
                onChange={(e) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      date:
                        e.target
                          .value,
                    }),
                  )
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="obs">
                Observação
              </Label>

              <Textarea
                id="obs"
                placeholder="Opcional"
                value={form.note}
                onChange={(e) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      note:
                        e.target.value,
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
              {editing
                ? "Salvar alterações"
                : form.type ===
                    "entrada"
                  ? "Adicionar entrada"
                  : "Adicionar gasto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(
          deleting,
        )}
        onOpenChange={(value) =>
          !value &&
          setDeleting(null)
        }
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