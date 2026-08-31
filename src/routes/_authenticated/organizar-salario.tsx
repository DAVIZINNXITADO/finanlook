import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Crown,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { useTransactions } from "@/lib/data";
import {
  addMonths,
  currentMonthKey,
  formatBRL,
  monthLabel,
  parseAmount,
} from "@/lib/finance";

export const Route = createFileRoute(
  "/_authenticated/organizar-salario",
)({
  head: () => ({
    meta: [
      {
        title: "Organizar salário — FinanLook",
      },
      {
        name: "description",
        content:
          "Planeje e organize seu salário entre suas prioridades financeiras.",
      },
      {
        property: "og:title",
        content: "Organizar salário — FinanLook",
      },
      {
        property: "og:description",
        content:
          "Organize seu dinheiro de forma manual ou automática.",
      },
    ],
  }),
  component: OrganizeSalaryPage,
});

type Organization = {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  isDefault?: boolean;
};

const DEFAULT_ORGANIZATIONS: Organization[] = [
  {
    id: "alimentacao",
    name: "Alimentação",
    emoji: "🍔",
    amount: 0,
    isDefault: true,
  },
  {
    id: "moradia",
    name: "Moradia",
    emoji: "🏠",
    amount: 0,
    isDefault: true,
  },
  {
    id: "transporte",
    name: "Transporte",
    emoji: "🚗",
    amount: 0,
    isDefault: true,
  },
  {
    id: "contas",
    name: "Contas",
    emoji: "🧾",
    amount: 0,
    isDefault: true,
  },
  {
    id: "lazer",
    name: "Lazer",
    emoji: "🎮",
    amount: 0,
    isDefault: true,
  },
  {
    id: "compras",
    name: "Compras",
    emoji: "🛒",
    amount: 0,
    isDefault: true,
  },
  {
    id: "saude",
    name: "Saúde",
    emoji: "🏥",
    amount: 0,
    isDefault: true,
  },
  {
    id: "reserva",
    name: "Reserva de emergência",
    emoji: "🛟",
    amount: 0,
    isDefault: true,
  },
  {
    id: "investimentos",
    name: "Investimentos",
    emoji: "📈",
    amount: 0,
    isDefault: true,
  },
  {
    id: "metas",
    name: "Metas",
    emoji: "🎯",
    amount: 0,
    isDefault: true,
  },
];

const EMOJIS = [
  "💰",
  "🎓",
  "🐶",
  "🎮",
  "✈️",
  "🏠",
  "🚗",
  "📱",
  "🎁",
  "💡",
  "🛒",
  "❤️",
];

function OrganizeSalaryPage() {
  const { data: transactions = [] } = useTransactions();

  const [selectedMonth, setSelectedMonth] = useState(
    currentMonthKey(),
  );

  const [organizations, setOrganizations] = useState<
    Organization[]
  >(DEFAULT_ORGANIZATIONS);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editing, setEditing] =
    useState<Organization | null>(null);

  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newEmoji, setNewEmoji] = useState("💰");

  /*
   * Entradas do mês selecionado.
   *
   * A organização usa apenas o dinheiro que entrou naquele mês
   * como valor disponível para planejamento.
   */
  const monthIncome = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          transaction.type === "entrada" &&
          transaction.date.slice(0, 7) === selectedMonth,
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0,
      );
  }, [transactions, selectedMonth]);

  /*
   * Total que o usuário já distribuiu.
   */
  const organizedAmount = useMemo(() => {
    return organizations.reduce(
      (total, organization) =>
        total + organization.amount,
      0,
    );
  }, [organizations]);

  /*
   * Dinheiro ainda não distribuído.
   */
  const remainingAmount = monthIncome - organizedAmount;

  /*
   * Porcentagem organizada.
   */
  const organizedPercentage =
    monthIncome > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (organizedAmount / monthIncome) * 100,
          ),
        )
      : 0;

  function previousMonth() {
    setSelectedMonth(
      addMonths(selectedMonth, -1),
    );
  }

  function nextMonth() {
    setSelectedMonth(
      addMonths(selectedMonth, 1),
    );
  }

  function openNewOrganization() {
    setEditing(null);
    setNewName("");
    setNewAmount("");
    setNewEmoji("💰");
    setDialogOpen(true);
  }

  function openEditOrganization(
    organization: Organization,
  ) {
    setEditing(organization);
    setNewName(organization.name);
    setNewAmount(
      String(organization.amount).replace(".", ","),
    );
    setNewEmoji(organization.emoji);
    setDialogOpen(true);
  }

  function saveOrganization() {
    const name = newName.trim();
    const amount = parseAmount(newAmount);

    if (!name) {
      toast.error(
        "Informe o nome da organização.",
      );
      return;
    }

    if (amount < 0) {
      toast.error(
        "O valor não pode ser negativo.",
      );
      return;
    }

    if (editing) {
      setOrganizations((current) =>
        current.map((organization) =>
          organization.id === editing.id
            ? {
                ...organization,
                name: name.slice(0, 60),
                emoji: newEmoji,
                amount,
              }
            : organization,
        ),
      );

      toast.success(
        "Organização atualizada.",
      );
    } else {
      const organization: Organization = {
        id: crypto.randomUUID(),
        name: name.slice(0, 60),
        emoji: newEmoji,
        amount,
      };

      setOrganizations((current) => [
        ...current,
        organization,
      ]);

      toast.success(
        "Nova organização adicionada.",
      );
    }

    setDialogOpen(false);
  }

  function removeOrganization(id: string) {
    setOrganizations((current) =>
      current.filter(
        (organization) =>
          organization.id !== id,
      ),
    );

    toast.success(
      "Organização removida.",
    );
  }

  function automaticOrganization() {
    toast.info(
      "A organização automática será um recurso Premium.",
    );
  }

  function clearAllValues() {
    setOrganizations((current) =>
      current.map((organization) => ({
        ...organization,
        amount: 0,
      })),
    );

    toast.success(
      "Os valores foram zerados.",
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizar salário"
        subtitle="Planeje como você quer distribuir seu dinheiro durante o mês."
      />

      {/* SELETOR DE MÊS */}
      <section className="surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">
              Mês da organização
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Organize seu planejamento mensal.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
            <Button
              variant="ghost"
              size="icon"
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
              aria-label="Próximo mês"
              onClick={nextMonth}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* RESUMO FINANCEIRO */}
      <section className="grid gap-3 md:grid-cols-3">
        <div className="surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="size-5 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Disponível para organizar
              </p>

              <p className="mt-1 text-xl font-bold">
                {formatBRL(monthIncome)}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Total das entradas em{" "}
            {monthLabel(selectedMonth)}.
          </p>
        </div>

        <div className="surface p-5">
          <p className="text-sm text-muted-foreground">
            Já organizado
          </p>

          <p className="mt-1 text-xl font-bold">
            {formatBRL(organizedAmount)}
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${organizedPercentage}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {organizedPercentage.toFixed(0)}%
            do dinheiro distribuído.
          </p>
        </div>

        <div className="surface p-5">
          <p className="text-sm text-muted-foreground">
            Saldo restante
          </p>

          <p
            className={
              remainingAmount >= 0
                ? "mt-1 text-xl font-bold text-success"
                : "mt-1 text-xl font-bold text-destructive"
            }
          >
            {formatBRL(remainingAmount)}
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            {remainingAmount >= 0
              ? "Valor que ainda pode ser organizado."
              : "Você organizou mais dinheiro do que recebeu neste mês."}
          </p>
        </div>
      </section>

      {/* ORGANIZAÇÃO AUTOMÁTICA */}
      <section className="surface overflow-hidden p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="size-6 text-primary" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-semibold">
                  Organização automática
                </h2>

                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  <Crown className="size-3" />
                  Premium
                </span>
              </div>

              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                O FinanLook analisa suas prioridades e
                sugere automaticamente como distribuir seu
                dinheiro entre gastos, reserva,
                investimentos e outras categorias.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="h-11"
            onClick={automaticOrganization}
          >
            <Sparkles className="size-4" />
            Organizar automaticamente
          </Button>
        </div>
      </section>

      {/* ORGANIZAÇÃO MANUAL */}
      <section className="surface p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Organização manual
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Escolha quanto deseja separar para cada
              prioridade.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllValues}
            >
              Zerar valores
            </Button>

            <Button
              size="sm"
              onClick={openNewOrganization}
            >
              <Plus className="size-4" />
              Nova organização
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {organizations.map(
            (organization) => {
              const percentage =
                monthIncome > 0
                  ? (organization.amount /
                      monthIncome) *
                    100
                  : 0;

              return (
                <div
                  key={organization.id}
                  className="rounded-2xl border p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">
                      {organization.emoji}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {organization.name}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {monthIncome > 0
                              ? `${percentage.toFixed(
                                  1,
                                )}% do disponível`
                              : "Aguardando entradas no mês"}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Editar ${organization.name}`}
                            onClick={() =>
                              openEditOrganization(
                                organization,
                              )
                            }
                          >
                            <Pencil className="size-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Remover ${organization.name}`}
                            onClick={() =>
                              removeOrganization(
                                organization.id,
                              )
                            }
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <p className="mt-4 text-lg font-bold">
                        {formatBRL(
                          organization.amount,
                        )}
                      </p>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                percentage,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </section>

      {/* SIMULAÇÃO */}
      <section className="surface p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="size-5 text-primary" />
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">
              Como ficaria seu dinheiro
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Simulação baseada na sua organização atual.
            </p>
          </div>
        </div>

        <div className="mt-5 divide-y divide-border rounded-xl border">
          <div className="flex items-center justify-between gap-4 p-4">
            <span className="text-sm">
              Entradas do mês
            </span>

            <span className="font-semibold text-success">
              {formatBRL(monthIncome)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 p-4">
            <span className="text-sm">
              Total organizado
            </span>

            <span className="font-semibold">
              {formatBRL(organizedAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 p-4">
            <span className="text-sm font-medium">
              Restante para organizar
            </span>

            <span
              className={
                remainingAmount >= 0
                  ? "font-bold text-success"
                  : "font-bold text-destructive"
              }
            >
              {formatBRL(remainingAmount)}
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Esta organização é um planejamento. Ela não
          altera automaticamente suas movimentações ou o
          saldo real das suas contas.
        </p>
      </section>

      {/* DIALOG */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? "Editar organização"
                : "Nova organização"}
            </DialogTitle>

            <DialogDescription>
              Escolha um nome e o valor que deseja separar
              neste mês.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="organization-name">
                Nome
              </Label>

              <Input
                id="organization-name"
                className="h-11"
                placeholder="Ex.: Curso"
                value={newName}
                onChange={(event) =>
                  setNewName(event.target.value)
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Ícone</Label>

              <Select
                value={newEmoji}
                onValueChange={setNewEmoji}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {EMOJIS.map((emoji) => (
                    <SelectItem
                      key={emoji}
                      value={emoji}
                    >
                      {emoji}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="organization-amount">
                Valor para separar
              </Label>

              <Input
                id="organization-amount"
                className="h-11"
                inputMode="decimal"
                placeholder="500,00"
                value={newAmount}
                onChange={(event) =>
                  setNewAmount(event.target.value)
                }
              />

              {newAmount ? (
                <p className="text-xs text-muted-foreground">
                  {formatBRL(
                    parseAmount(newAmount),
                  )}
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              onClick={saveOrganization}
            >
              {editing
                ? "Salvar alterações"
                : "Adicionar organização"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}