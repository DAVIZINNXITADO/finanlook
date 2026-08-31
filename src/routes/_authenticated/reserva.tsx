import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarClock,
  Check,
  CircleHelp,
  Edit3,
  History,
  PiggyBank,
  Settings2,
  Target,
  Trash2,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

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

import { PageHeader } from "@/components/PageHeader";

import {
  useReserve,
  useSaveReserve,
  useSaveTransaction,
  useTransactions,
  type TransactionInput,
} from "@/lib/data";

import {
  formatBRL,
  formatDateBR,
  parseAmount,
  todayISO,
  type Transaction,
} from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/reserva")({
  head: () => ({
    meta: [
      { title: "Minha reserva — FinanLook" },
      {
        name: "description",
        content:
          "Crie sua reserva de emergência, adicione dinheiro, acompanhe o progresso e configure aportes automáticos.",
      },
      {
        property: "og:title",
        content: "Minha reserva — FinanLook",
      },
      {
        property: "og:description",
        content:
          "Acompanhe e organize sua reserva de emergência no FinanLook.",
      },
    ],
  }),
  component: ReservePage,
});

const RESERVE_CATEGORY = "Reserva de emergência";
const AUTO_STORAGE_KEY = "finanlook-reserva-automatico";

type AutoFrequency = "semanal" | "quinzenal" | "mensal";

type AutoConfig = {
  enabled: boolean;
  amount: string;
  frequency: AutoFrequency;
  nextDate: string;
};

type ReserveForm = {
  target: string;
  hasTarget: boolean;
};

const defaultAutoConfig = (): AutoConfig => ({
  enabled: false,
  amount: "",
  frequency: "mensal",
  nextDate: todayISO(),
});

function loadAutoConfig(): AutoConfig {
  if (typeof window === "undefined") {
    return defaultAutoConfig();
  }

  try {
    const raw = localStorage.getItem(AUTO_STORAGE_KEY);

    if (!raw) {
      return defaultAutoConfig();
    }

    const parsed = JSON.parse(raw);

    return {
      enabled: Boolean(parsed.enabled),
      amount: typeof parsed.amount === "string" ? parsed.amount : "",
      frequency:
        parsed.frequency === "semanal" ||
        parsed.frequency === "quinzenal" ||
        parsed.frequency === "mensal"
          ? parsed.frequency
          : "mensal",
      nextDate:
        typeof parsed.nextDate === "string"
          ? parsed.nextDate
          : todayISO(),
    };
  } catch {
    return defaultAutoConfig();
  }
}

function saveAutoConfig(config: AutoConfig) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    AUTO_STORAGE_KEY,
    JSON.stringify(config),
  );
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
}

function getNextDate(
  dateString: string,
  frequency: AutoFrequency,
) {
  if (frequency === "semanal") {
    return addDays(dateString, 7);
  }

  if (frequency === "quinzenal") {
    return addDays(dateString, 15);
  }

  return addDays(dateString, 30);
}

function ReservePage() {
  const { data: reserve, isLoading: reserveLoading } =
    useReserve();

  const { data: transactions = [] } =
    useTransactions();

  const saveReserve = useSaveReserve();
  const saveTransaction = useSaveTransaction();

  const [target, setTarget] = useState("");
  const [hasTarget, setHasTarget] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);

  const [amount, setAmount] = useState("");
  const [removeAmount, setRemoveAmount] = useState("");
  const [auto, setAuto] =
    useState<AutoConfig>(defaultAutoConfig);

  const [deleteAutoOpen, setDeleteAutoOpen] =
    useState(false);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reserveLoading || ready) return;

    const targetValue = Number(
      reserve?.target_amount ?? 0,
    );

    setTarget(
      targetValue > 0
        ? String(targetValue).replace(".", ",")
        : "",
    );

    setHasTarget(targetValue > 0);
    setAuto(loadAutoConfig());
    setReady(true);
  }, [reserveLoading, reserve, ready]);

  /*
   * Todas as movimentações da categoria da reserva.
   *
   * Entrada:
   *   representa uma retirada da reserva.
   *
   * Saída:
   *   representa dinheiro colocado na reserva.
   */
  const reserveTransactions = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          t.category === RESERVE_CATEGORY,
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime(),
      );
  }, [transactions]);

  const deposits = useMemo(
    () =>
      reserveTransactions.filter(
        (t) => t.type === "saida",
      ),
    [reserveTransactions],
  );

  const withdrawals = useMemo(
    () =>
      reserveTransactions.filter(
        (t) => t.type === "entrada",
      ),
    [reserveTransactions],
  );

  const totalDeposited = useMemo(
    () =>
      deposits.reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      ),
    [deposits],
  );

  const totalWithdrawn = useMemo(
    () =>
      withdrawals.reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      ),
    [withdrawals],
  );

  /*
   * O saldo da reserva é calculado pelas próprias
   * movimentações. Assim não precisamos ficar alterando
   * manualmente o "valor atual".
   */
  const currentValue = Math.max(
    totalDeposited - totalWithdrawn,
    0,
  );

  const targetValue = hasTarget
    ? parseAmount(target)
    : 0;

  const progress =
    targetValue > 0
      ? Math.min(
          (currentValue / targetValue) * 100,
          100,
        )
      : 0;

  const missing = Math.max(
    targetValue - currentValue,
    0,
  );

  const autoAmount = parseAmount(auto.amount);

  const recentTransactions =
    reserveTransactions.slice(0, 8);

  async function addReserveMoney() {
    const value = parseAmount(amount);

    if (value <= 0) {
      toast.error(
        "Informe um valor maior que zero.",
      );
      return;
    }

    const values: TransactionInput = {
      type: "saida",
      description: "Aporte na reserva",
      amount: value,
      category: RESERVE_CATEGORY,
      date: todayISO(),
      note: "Dinheiro adicionado à reserva de emergência.",
    };

    try {
      await saveTransaction.mutateAsync({
        values,
      });

      toast.success(
        `${formatBRL(value)} adicionados à sua reserva!`,
      );

      setAmount("");
      setAddOpen(false);
    } catch {
      toast.error(
        "Não foi possível adicionar dinheiro à reserva.",
      );
    }
  }

  async function removeReserveMoney() {
    const value = parseAmount(removeAmount);

    if (value <= 0) {
      toast.error(
        "Informe um valor maior que zero.",
      );
      return;
    }

    if (value > currentValue) {
      toast.error(
        "Você não pode retirar mais do que existe na reserva.",
      );
      return;
    }

    const values: TransactionInput = {
      type: "entrada",
      description: "Retirada da reserva",
      amount: value,
      category: RESERVE_CATEGORY,
      date: todayISO(),
      note: "Valor retirado da reserva de emergência.",
    };

    try {
      await saveTransaction.mutateAsync({
        values,
      });

      toast.success(
        `${formatBRL(value)} retirados da sua reserva.`,
      );

      setRemoveAmount("");
      setRemoveOpen(false);
    } catch {
      toast.error(
        "Não foi possível retirar dinheiro da reserva.",
      );
    }
  }

  async function saveTarget() {
    const value = hasTarget
      ? parseAmount(target)
      : 0;

    if (hasTarget && value <= 0) {
      toast.error(
        "Informe um objetivo maior que zero.",
      );
      return;
    }

    try {
      await saveReserve.mutateAsync({
        target_amount: value,
        current_amount: currentValue,
      });

      toast.success(
        hasTarget
          ? "Meta da reserva atualizada!"
          : "Meta da reserva removida.",
      );

      setTargetOpen(false);
    } catch {
      toast.error(
        "Não foi possível atualizar a meta.",
      );
    }
  }

  function configureAuto() {
    if (autoAmount <= 0) {
      toast.error(
        "Informe quanto deseja adicionar automaticamente.",
      );
      return;
    }

    const next = {
      ...auto,
      enabled: true,
    };

    saveAutoConfig(next);
    setAuto(next);
    setAutoOpen(false);

    toast.success(
      "Aporte automático configurado!",
    );
  }

  function disableAuto() {
    const next = {
      ...auto,
      enabled: false,
    };

    saveAutoConfig(next);
    setAuto(next);
    setDeleteAutoOpen(false);

    toast.success(
      "Aporte automático desativado.",
    );
  }

  /*
   * Processa um aporte automático quando a página é aberta
   * depois da data programada.
   *
   * Isso não inventa uma nova estrutura no banco:
   * ele simplesmente cria uma movimentação normal.
   */
  useEffect(() => {
    if (!ready || !auto.enabled) return;

    const amountValue = parseAmount(auto.amount);

    if (amountValue <= 0) return;

    const today = todayISO();

    if (auto.nextDate > today) return;

    let cancelled = false;

    async function processAutomaticDeposit() {
      try {
        await saveTransaction.mutateAsync({
          values: {
            type: "saida",
            description:
              "Aporte automático na reserva",
            amount: amountValue,
            category: RESERVE_CATEGORY,
            date: today,
            note:
              "Aporte criado automaticamente pela configuração da reserva.",
          },
        });

        if (cancelled) return;

        let nextDate = auto.nextDate;

        while (nextDate <= today) {
          nextDate = getNextDate(
            nextDate,
            auto.frequency,
          );
        }

        const nextConfig = {
          ...auto,
          nextDate,
        };

        saveAutoConfig(nextConfig);
        setAuto(nextConfig);

        toast.success(
          `${formatBRL(amountValue)} foram adicionados automaticamente à reserva.`,
        );
      } catch {
        if (!cancelled) {
          toast.error(
            "Não foi possível realizar o aporte automático.",
          );
        }
      }
    }

    void processAutomaticDeposit();

    return () => {
      cancelled = true;
    };
  }, [
    ready,
    auto.enabled,
    auto.amount,
    auto.frequency,
    auto.nextDate,
    saveTransaction,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minha reserva"
        subtitle="Construa sua segurança financeira aos poucos, do seu jeito."
      />

      <section className="surface overflow-hidden">
        <div className="hero-gradient p-6 text-primary-foreground sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <PiggyBank className="size-4" />
                Reserva de emergência
              </div>

              <p className="mt-3 text-3xl font-semibold sm:text-4xl">
                {formatBRL(currentValue)}
              </p>

              <p className="mt-1 text-sm opacity-80">
                disponível na sua reserva
              </p>
            </div>

            <div className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-white/15">
              <PiggyBank className="size-10" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <Button
            className="h-12"
            onClick={() => setAddOpen(true)}
          >
            <ArrowDownToLine className="size-4" />
            Adicionar dinheiro
          </Button>

          <Button
            variant="outline"
            className="h-12"
            onClick={() => setRemoveOpen(true)}
            disabled={currentValue <= 0}
          >
            <ArrowUpFromLine className="size-4" />
            Retirar dinheiro
          </Button>
        </div>
      </section>

      <section className="surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="size-5 text-primary" />

              <h2 className="font-display text-lg font-semibold">
                {hasTarget
                  ? "Objetivo da reserva"
                  : "Sua reserva, sem pressão"}
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {hasTarget
                ? "Acompanhe quanto já conseguiu guardar e quanto falta."
                : "Você pode guardar dinheiro sem definir uma meta por enquanto."}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTargetOpen(true)}
          >
            <Edit3 className="size-4" />
            {hasTarget
              ? "Alterar meta"
              : "Definir meta"}
          </Button>
        </div>

        {hasTarget ? (
          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold">
                  {formatBRL(currentValue)}
                </p>

                <p className="text-sm text-muted-foreground">
                  de {formatBRL(targetValue)}
                </p>
              </div>

              <p className="text-sm font-semibold">
                {Math.round(progress)}%
              </p>
            </div>

            <Progress
              value={progress}
              className="mt-4 h-3"
            />

            <p className="mt-3 text-sm text-muted-foreground">
              {missing > 0
                ? `Faltam ${formatBRL(missing)} para alcançar seu objetivo.`
                : "Você alcançou sua meta! Parabéns por essa conquista. 🎉"}
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-border p-5">
            <div className="flex gap-3">
              <CircleHelp className="mt-0.5 size-5 shrink-0 text-primary" />

              <div>
                <p className="text-sm font-medium">
                  Não quer definir uma meta agora?
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Sem problema. Continue adicionando dinheiro e
                  acompanhe o crescimento da sua reserva.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarClock className="size-5 text-primary" />

              <h2 className="font-display text-lg font-semibold">
                Aportes automáticos
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Separe um valor automaticamente em uma frequência que
              faça sentido para você.
            </p>
          </div>

          {auto.enabled ? (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold">
              <Check className="size-3.5" />
              Ativo
            </span>
          ) : null}
        </div>

        {auto.enabled ? (
          <div className="mt-5 rounded-2xl bg-accent/50 p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Valor
                </p>

                <p className="mt-1 font-semibold">
                  {formatBRL(autoAmount)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Frequência
                </p>

                <p className="mt-1 font-semibold capitalize">
                  {auto.frequency}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Próximo aporte
                </p>

                <p className="mt-1 font-semibold">
                  {formatDateBR(auto.nextDate)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoOpen(true)}
              >
                <Settings2 className="size-4" />
                Editar automático
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDeleteAutoOpen(true)
                }
              >
                <Trash2 className="size-4" />
                Desativar
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <Button
              className="h-11"
              onClick={() => setAutoOpen(true)}
            >
              <CalendarClock className="size-4" />
              Configurar aporte automático
            </Button>

            <p className="mt-2 text-xs text-muted-foreground">
              Você pode desligar quando quiser.
            </p>
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="surface p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="size-4" />
            Total colocado
          </div>

          <p className="mt-2 text-xl font-semibold">
            {formatBRL(totalDeposited)}
          </p>
        </div>

        <div className="surface p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowUpFromLine className="size-4" />
            Total retirado
          </div>

          <p className="mt-2 text-xl font-semibold">
            {formatBRL(totalWithdrawn)}
          </p>
        </div>

        <div className="surface p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PiggyBank className="size-4" />
            Saldo da reserva
          </div>

          <p className="mt-2 text-xl font-semibold">
            {formatBRL(currentValue)}
          </p>
        </div>
      </section>

      <section className="surface p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <History className="size-5 text-primary" />

              <h2 className="font-display text-lg font-semibold">
                Histórico da reserva
              </h2>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Veja os últimos valores que entraram e saíram.
            </p>
          </div>

          <Button
            asChild
            variant="ghost"
            size="sm"
          >
            <Link to="/movimentacoes">
              Ver tudo
            </Link>
          </Button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium">
              Sua reserva ainda está vazia.
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Comece com qualquer valor. O importante é começar.
            </p>

            <Button
              className="mt-4"
              onClick={() => setAddOpen(true)}
            >
              <PiggyBank className="size-4" />
              Fazer primeiro aporte
            </Button>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {recentTransactions.map(
              (transaction) => {
                const isDeposit =
                  transaction.type === "saida";

                return (
                  <li
                    key={transaction.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      {isDeposit ? (
                        <ArrowDownToLine className="size-4" />
                      ) : (
                        <ArrowUpFromLine className="size-4" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {transaction.description}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {formatDateBR(transaction.date)}
                      </p>
                    </div>

                    <span
                      className={
                        isDeposit
                          ? "text-sm font-semibold text-success"
                          : "text-sm font-semibold text-destructive"
                      }
                    >
                      {isDeposit ? "+" : "−"}{" "}
                      {formatBRL(
                        transaction.amount,
                      )}
                    </span>
                  </li>
                );
              },
            )}
          </ul>
        )}
      </section>

      <p className="rounded-2xl bg-accent/50 px-4 py-3 text-xs text-muted-foreground">
        💡 O FinanLook registra os aportes e retiradas como
        movimentações normais. Assim seu saldo e seus relatórios
        continuam sempre sincronizados.
      </p>

      {/* ADICIONAR DINHEIRO */}

      <Dialog
        open={addOpen}
        onOpenChange={setAddOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Adicionar dinheiro
            </DialogTitle>

            <DialogDescription>
              Esse valor será registrado automaticamente como um
              aporte na sua reserva.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="add-reserve">
              Quanto deseja adicionar?
            </Label>

            <Input
              id="add-reserve"
              inputMode="decimal"
              autoFocus
              className="h-12 text-lg"
              placeholder="100,00"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
            />

            {amount ? (
              <p className="text-xs text-muted-foreground">
                Você está adicionando{" "}
                {formatBRL(parseAmount(amount))}.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              onClick={() =>
                void addReserveMoney()
              }
              disabled={saveTransaction.isPending}
            >
              {saveTransaction.isPending
                ? "Adicionando..."
                : "Adicionar à reserva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RETIRAR DINHEIRO */}

      <Dialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Retirar dinheiro
            </DialogTitle>

            <DialogDescription>
              O valor será registrado como uma retirada da sua
              reserva.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl bg-accent/50 p-3 text-sm">
            Disponível atualmente:{" "}
            <strong>{formatBRL(currentValue)}</strong>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remove-reserve">
              Quanto deseja retirar?
            </Label>

            <Input
              id="remove-reserve"
              inputMode="decimal"
              autoFocus
              className="h-12 text-lg"
              placeholder="50,00"
              value={removeAmount}
              onChange={(e) =>
                setRemoveAmount(e.target.value)
              }
            />
          </div>

          <DialogFooter>
            <Button
              variant="destructive"
              className="h-11 w-full"
              onClick={() =>
                void removeReserveMoney()
              }
              disabled={saveTransaction.isPending}
            >
              {saveTransaction.isPending
                ? "Retirando..."
                : "Retirar da reserva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* META */}

      <Dialog
        open={targetOpen}
        onOpenChange={setTargetOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Objetivo da reserva
            </DialogTitle>

            <DialogDescription>
              Escolha se quer acompanhar uma meta ou simplesmente
              guardar sem definir um valor final.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={
                hasTarget
                  ? "default"
                  : "outline"
              }
              className="h-12"
              onClick={() =>
                setHasTarget(true)
              }
            >
              <Target className="size-4" />
              Definir meta
            </Button>

            <Button
              type="button"
              variant={
                !hasTarget
                  ? "default"
                  : "outline"
              }
              className="h-12"
              onClick={() =>
                setHasTarget(false)
              }
            >
              Sem meta
            </Button>
          </div>

          {hasTarget ? (
            <div className="space-y-2">
              <Label htmlFor="reserve-target">
                Quanto você quer alcançar?
              </Label>

              <Input
                id="reserve-target"
                inputMode="decimal"
                className="h-12"
                placeholder="3000,00"
                value={target}
                onChange={(e) =>
                  setTarget(e.target.value)
                }
              />
            </div>
          ) : (
            <div className="rounded-xl bg-accent/50 p-4 text-sm">
              Tudo certo. Sua reserva continuará crescendo sem
              precisar de uma meta.
            </div>
          )}

          <DialogFooter>
            <Button
              className="h-11 w-full"
              onClick={() =>
                void saveTarget()
              }
              disabled={saveReserve.isPending}
            >
              {saveReserve.isPending
                ? "Salvando..."
                : "Salvar configuração"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AUTOMÁTICO */}

      <Dialog
        open={autoOpen}
        onOpenChange={setAutoOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {auto.enabled
                ? "Editar aporte automático"
                : "Configurar aporte automático"}
            </DialogTitle>

            <DialogDescription>
              Escolha um valor e a frequência. O FinanLook criará
              uma movimentação de aporte automaticamente quando chegar
              a data programada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auto-amount">
                Valor de cada aporte
              </Label>

              <Input
                id="auto-amount"
                inputMode="decimal"
                className="h-11"
                placeholder="100,00"
                value={auto.amount}
                onChange={(e) =>
                  setAuto((previous) => ({
                    ...previous,
                    amount: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Frequência
              </Label>

              <Select
                value={auto.frequency}
                onValueChange={(frequency) =>
                  setAuto((previous) => ({
                    ...previous,
                    frequency:
                      frequency as AutoFrequency,
                  }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="semanal">
                    Toda semana
                  </SelectItem>

                  <SelectItem value="quinzenal">
                    A cada 15 dias
                  </SelectItem>

                  <SelectItem value="mensal">
                    Todo mês
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto-next">
                Primeiro aporte
              </Label>

              <Input
                id="auto-next"
                type="date"
                className="h-11"
                value={auto.nextDate}
                onChange={(e) =>
                  setAuto((previous) => ({
                    ...previous,
                    nextDate: e.target.value,
                  }))
                }
              />

              <p className="text-xs text-muted-foreground">
                A partir dessa data, o próximo aporte será
                calculado conforme a frequência escolhida.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              onClick={configureAuto}
            >
              <Check className="size-4" />
              Ativar aporte automático
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DESATIVAR AUTOMÁTICO */}

      <AlertDialog
        open={deleteAutoOpen}
        onOpenChange={setDeleteAutoOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Desativar aporte automático?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Nenhum novo aporte automático será criado. Os
              aportes que já foram registrados continuam na sua
              reserva normalmente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={disableAuto}
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}