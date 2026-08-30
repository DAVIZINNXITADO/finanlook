import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
  Check,
  Pencil,
  PiggyBank,
  Plus,
  Settings2,
  Target,
  Trash2,
  TrendingUp,
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
import { PageHeader } from "@/components/PageHeader";

import {
  useDeleteTransaction,
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
          "Construa, acompanhe e organize sua reserva de emergência diretamente pelo FinanLook.",
      },
      {
        property: "og:title",
        content: "Minha reserva — FinanLook",
      },
      {
        property: "og:description",
        content:
          "Acompanhe e organize sua reserva de emergência.",
      },
    ],
  }),
  component: ReservePage,
});

type ActionType = "adicionar" | "retirar" | "ajustar";

type ActionForm = {
  amount: string;
  description: string;
  date: string;
};

const emptyActionForm = (): ActionForm => ({
  amount: "",
  description: "",
  date: todayISO(),
});

function ReservePage() {
  const { data: reserve, isLoading: reserveLoading } = useReserve();
  const { data: transactions = [], isLoading: transactionsLoading } =
    useTransactions();

  const saveReserve = useSaveReserve();
  const saveTransaction = useSaveTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [target, setTarget] = useState("");
  const [targetReady, setTargetReady] = useState(false);

  const [action, setAction] = useState<ActionType | null>(null);
  const [actionForm, setActionForm] =
    useState<ActionForm>(emptyActionForm);

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const [showTargetDialog, setShowTargetDialog] =
    useState(false);

  /*
   * Reserva é formada pelas próprias movimentações.
   *
   * Entrada  + categoria Reserva de emergência = retirada/devolução
   * Saída    + categoria Reserva de emergência = aporte
   *
   * Portanto:
   * saldo = aportes - retiradas
   */

  const reserveTransactions = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          t.category === "Reserva de emergência" &&
          !t.is_demo,
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime(),
      );
  }, [transactions]);

  const contributions = useMemo(
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

  const totalContributed = useMemo(
    () =>
      contributions.reduce(
        (total, t) => total + Number(t.amount),
        0,
      ),
    [contributions],
  );

  const totalWithdrawn = useMemo(
    () =>
      withdrawals.reduce(
        (total, t) => total + Number(t.amount),
        0,
      ),
    [withdrawals],
  );

  const currentValue = Math.max(
    totalContributed - totalWithdrawn,
    0,
  );

  /*
   * Carrega somente a meta.
   * O saldo atual NÃO é carregado do reserve.current_amount.
   */
  if (!targetReady && !reserveLoading) {
    setTarget(
      reserve?.target_amount
        ? String(Number(reserve.target_amount)).replace(".", ",")
        : "",
    );
    setTargetReady(true);
  }

  const targetValue = parseAmount(target);

  const progress =
    targetValue > 0
      ? Math.min((currentValue / targetValue) * 100, 100)
      : 0;

  const missing = Math.max(
    targetValue - currentValue,
    0,
  );

  const averageContribution =
    contributions.length > 0
      ? totalContributed / contributions.length
      : 0;

  const firstContribution =
    contributions.length > 0
      ? contributions[contributions.length - 1]
      : null;

  const estimatedContributions =
    averageContribution > 0 && missing > 0
      ? Math.ceil(missing / averageContribution)
      : 0;

  function openAction(type: ActionType) {
    setAction(type);
    setActionForm({
      ...emptyActionForm(),
      description:
        type === "adicionar"
          ? "Aporte na reserva"
          : type === "retirar"
            ? "Retirada da reserva"
            : "Ajuste da reserva",
    });
  }

  function closeAction() {
    setAction(null);
    setActionForm(emptyActionForm());
  }

  async function handleAction() {
    if (!action) return;

    const amount = parseAmount(actionForm.amount);

    if (amount <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }

    if (action === "retirar" && amount > currentValue) {
      toast.error(
        "O valor da retirada não pode ser maior que sua reserva.",
      );
      return;
    }

    const values: TransactionInput = {
      type:
        action === "adicionar"
          ? "saida"
          : "entrada",
      description:
        actionForm.description.trim() ||
        (action === "adicionar"
          ? "Aporte na reserva"
          : action === "retirar"
            ? "Retirada da reserva"
            : "Ajuste da reserva"),
      amount,
      category: "Reserva de emergência",
      date: actionForm.date,
      note: null,
    };

    try {
      await saveTransaction.mutateAsync({
        values,
      });

      toast.success(
        action === "adicionar"
          ? `${formatBRL(amount)} adicionados à reserva!`
          : action === "retirar"
            ? `${formatBRL(amount)} retirados da reserva.`
            : `Ajuste de ${formatBRL(amount)} registrado.`,
      );

      closeAction();
    } catch {
      toast.error(
        "Não foi possível registrar essa movimentação.",
      );
    }
  }

  function openEdit(t: Transaction) {
    setEditing(t);
    setActionForm({
      amount: String(Number(t.amount)).replace(
        ".",
        ",",
      ),
      description: t.description,
      date: t.date.slice(0, 10),
    });
  }

  async function handleEdit() {
    if (!editing) return;

    const amount = parseAmount(actionForm.amount);

    if (amount <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }

    if (
      editing.type === "entrada" &&
      amount > currentValue + Number(editing.amount)
    ) {
      toast.error(
        "O valor da retirada não pode ser maior que a reserva.",
      );
      return;
    }

    const values: TransactionInput = {
      type:
        editing.type === "entrada"
          ? "entrada"
          : "saida",
      description:
        actionForm.description.trim() ||
        editing.description,
      amount,
      category: "Reserva de emergência",
      date: actionForm.date,
      note: editing.note ?? null,
    };

    try {
      await saveTransaction.mutateAsync({
        id: editing.id,
        values,
      });

      toast.success("Aporte atualizado.");
      setEditing(null);
      setActionForm(emptyActionForm());
    } catch {
      toast.error(
        "Não foi possível atualizar o aporte.",
      );
    }
  }

  async function confirmDelete() {
    if (!deleting) return;

    try {
      await deleteTransaction.mutateAsync(
        deleting.id,
      );

      toast.success("Movimentação da reserva excluída.");
      setDeleting(null);
    } catch {
      toast.error(
        "Não foi possível excluir a movimentação.",
      );
    }
  }

  async function saveTarget() {
    if (targetValue < 0) {
      toast.error("Informe uma meta válida.");
      return;
    }

    try {
      await saveReserve.mutateAsync({
        target_amount: targetValue,
        /*
         * Mantemos o campo por compatibilidade com
         * a estrutura atual, mas o valor exibido na tela
         * continua sendo calculado pelas movimentações.
         */
        current_amount: currentValue,
      });

      toast.success(
        targetValue > 0
          ? "Meta da reserva atualizada!"
          : "Meta removida.",
      );

      setShowTargetDialog(false);
    } catch {
      toast.error(
        "Não foi possível salvar a meta.",
      );
    }
  }

  const loading =
    reserveLoading || transactionsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minha reserva"
        subtitle="Construa sua proteção financeira aos poucos, sem complicação."
      />

      <section className="surface overflow-hidden">
        <div className="hero-gradient px-5 py-7 text-primary-foreground sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-white/15">
                <PiggyBank className="size-6" />
              </div>

              <p className="text-sm opacity-85">
                Você já separou
              </p>

              <p className="mt-1 font-display text-3xl font-bold">
                {formatBRL(currentValue)}
              </p>

              <p className="mt-2 max-w-md text-sm opacity-85">
                Esse valor é calculado automaticamente a
                partir das movimentações da sua reserva.
              </p>
            </div>

            <Button
              variant="secondary"
              className="shrink-0"
              onClick={() => openAction("adicionar")}
            >
              <Plus className="size-4" />
              Adicionar
            </Button>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {targetValue > 0 ? (
            <>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Progresso da meta
                  </p>

                  <p className="mt-1 font-display text-xl font-semibold">
                    {Math.round(progress)}%
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setShowTargetDialog(true)
                  }
                >
                  <Settings2 className="size-4" />
                  Alterar meta
                </Button>
              </div>

              <Progress
                value={progress}
                className="mt-4 h-3"
              />

              <div className="mt-3 flex justify-between text-sm">
                <span className="font-medium">
                  {formatBRL(currentValue)}
                </span>

                <span className="text-muted-foreground">
                  de {formatBRL(targetValue)}
                </span>
              </div>

              <div className="mt-4 rounded-2xl bg-accent/60 p-4">
                {currentValue >= targetValue ? (
                  <div className="flex gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
                      <Check className="size-5" />
                    </span>

                    <div>
                      <p className="text-sm font-semibold">
                        Meta alcançada! 🎉
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Você chegou ao objetivo que definiu
                        para sua reserva.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Target className="size-5" />
                    </span>

                    <div>
                      <p className="text-sm font-semibold">
                        Falta {formatBRL(missing)}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Continue com aportes que façam
                        sentido para você.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg font-semibold">
                  Você ainda não definiu uma meta.
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Tudo bem. Você pode simplesmente acompanhar
                  quanto está conseguindo guardar.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setShowTargetDialog(true)
                }
              >
                <Target className="size-4" />
                Definir uma meta
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => openAction("adicionar")}
          className="surface p-5 text-left transition-transform hover:-translate-y-0.5"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-success/10 text-success">
            <ArrowDownToLine className="size-5" />
          </span>

          <p className="mt-3 text-sm font-semibold">
            Adicionar dinheiro
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Faça um novo aporte na sua reserva.
          </p>
        </button>

        <button
          type="button"
          onClick={() => openAction("retirar")}
          disabled={currentValue <= 0}
          className="surface p-5 text-left transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <ArrowUpFromLine className="size-5" />
          </span>

          <p className="mt-3 text-sm font-semibold">
            Retirar dinheiro
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Registre uma retirada sem perder o histórico.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setShowTargetDialog(true)}
          className="surface p-5 text-left transition-transform hover:-translate-y-0.5"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target className="size-5" />
          </span>

          <p className="mt-3 text-sm font-semibold">
            {targetValue > 0
              ? "Ajustar meta"
              : "Definir meta"}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Escolha um objetivo para acompanhar seu progresso.
          </p>
        </button>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="surface p-5">
          <p className="text-xs font-medium text-muted-foreground">
            Total adicionado
          </p>

          <p className="mt-2 font-display text-xl font-semibold">
            {formatBRL(totalContributed)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {contributions.length}{" "}
            {contributions.length === 1
              ? "aporte"
              : "aportes"}
          </p>
        </div>

        <div className="surface p-5">
          <p className="text-xs font-medium text-muted-foreground">
            Total retirado
          </p>

          <p className="mt-2 font-display text-xl font-semibold">
            {formatBRL(totalWithdrawn)}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {withdrawals.length}{" "}
            {withdrawals.length === 1
              ? "retirada"
              : "retiradas"}
          </p>
        </div>

        <div className="surface p-5">
          <p className="text-xs font-medium text-muted-foreground">
            Ritmo médio
          </p>

          <p className="mt-2 font-display text-xl font-semibold">
            {averageContribution > 0
              ? formatBRL(averageContribution)
              : "—"}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            por aporte registrado
          </p>
        </div>
      </section>

      {targetValue > 0 &&
      missing > 0 &&
      estimatedContributions > 0 ? (
        <section className="surface p-5">
          <div className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="size-5" />
            </span>

            <div>
              <h2 className="font-display text-base font-semibold">
                Seu ritmo atual
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Mantendo uma média de{" "}
                <strong>
                  {formatBRL(averageContribution)}
                </strong>{" "}
                por aporte, faltariam aproximadamente{" "}
                <strong>
                  {estimatedContributions}{" "}
                  {estimatedContributions === 1
                    ? "aporte"
                    : "aportes"}
                </strong>{" "}
                para alcançar sua meta.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="surface p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Histórico da reserva
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Todos os aportes e retiradas ficam registrados
              nas suas movimentações.
            </p>
          </div>

          {reserveTransactions.length > 0 ? (
            <span className="text-xs font-medium text-muted-foreground">
              {reserveTransactions.length} registros
            </span>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-muted-foreground">
            Carregando sua reserva...
          </p>
        ) : reserveTransactions.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border p-7 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent">
              <PiggyBank className="size-6 text-primary" />
            </span>

            <p className="mt-3 text-sm font-semibold">
              Sua reserva ainda está vazia
            </p>

            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Comece com qualquer valor que faça sentido
              para você. Pequenos aportes também contam.
            </p>

            <Button
              className="mt-4"
              onClick={() => openAction("adicionar")}
            >
              <Plus className="size-4" />
              Fazer primeiro aporte
            </Button>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-border">
            {reserveTransactions
              .slice(0, 10)
              .map((t) => {
                const isContribution =
                  t.type === "saida";

                return (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <span
                      className={
                        isContribution
                          ? "flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success"
                          : "flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
                      }
                    >
                      {isContribution ? (
                        <ArrowDownToLine className="size-4" />
                      ) : (
                        <ArrowUpFromLine className="size-4" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {t.description}
                      </p>

                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="size-3" />
                        {formatDateBR(t.date)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <span
                        className={
                          isContribution
                            ? "mr-1 text-sm font-semibold text-success"
                            : "mr-1 text-sm font-semibold text-destructive"
                        }
                      >
                        {isContribution ? "+" : "−"}{" "}
                        {formatBRL(t.amount)}
                      </span>

                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar"
                        onClick={() => openEdit(t)}
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
                  </li>
                );
              })}
          </ul>
        )}
      </section>

      <section className="surface p-5">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent">
            💡
          </span>

          <div>
            <h2 className="font-display text-base font-semibold">
              Uma reserva é construída aos poucos
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Não precisa começar com um valor alto. O mais
              importante é acompanhar o que você consegue
              separar e manter uma visão clara do seu dinheiro.
            </p>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        O FinanLook é uma ferramenta de organização pessoal.
        Não vendemos investimentos nem prometemos rentabilidade.
      </p>

      {/* ADICIONAR / RETIRAR / AJUSTAR */}

      <Dialog
        open={Boolean(action)}
        onOpenChange={(open) => {
          if (!open) closeAction();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === "adicionar"
                ? "Adicionar à reserva"
                : action === "retirar"
                  ? "Retirar da reserva"
                  : "Ajustar reserva"}
            </DialogTitle>

            <DialogDescription>
              {action === "adicionar"
                ? "Registre um novo valor separado para sua reserva."
                : action === "retirar"
                  ? "Registre o valor que está saindo da sua reserva."
                  : "Use esta opção para registrar um ajuste no valor reservado."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reserve-action-amount">
                Valor
              </Label>

              <Input
                id="reserve-action-amount"
                className="h-11"
                inputMode="decimal"
                placeholder="100,00"
                value={actionForm.amount}
                onChange={(e) =>
                  setActionForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                autoFocus
              />

              {actionForm.amount ? (
                <p className="text-xs text-muted-foreground">
                  {formatBRL(
                    parseAmount(
                      actionForm.amount,
                    ),
                  )}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reserve-action-description">
                Descrição
              </Label>

              <Input
                id="reserve-action-description"
                className="h-11"
                placeholder={
                  action === "adicionar"
                    ? "Aporte na reserva"
                    : "Retirada da reserva"
                }
                value={actionForm.description}
                onChange={(e) =>
                  setActionForm((prev) => ({
                    ...prev,
                    description:
                      e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reserve-action-date">
                Data
              </Label>

              <Input
                id="reserve-action-date"
                type="date"
                className="h-11"
                value={actionForm.date}
                onChange={(e) =>
                  setActionForm((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              onClick={() => void handleAction()}
              disabled={saveTransaction.isPending}
            >
              {saveTransaction.isPending
                ? "Salvando..."
                : action === "adicionar"
                  ? "Adicionar à reserva"
                  : action === "retirar"
                    ? "Confirmar retirada"
                    : "Registrar ajuste"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDITAR */}

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setActionForm(emptyActionForm());
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Editar movimentação
            </DialogTitle>

            <DialogDescription>
              Altere os dados desse registro da sua reserva.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl bg-accent/60 px-4 py-3 text-sm">
              {editing?.type === "saida"
                ? "Este registro representa um aporte."
                : "Este registro representa uma retirada."}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-reserve-amount">
                Valor
              </Label>

              <Input
                id="edit-reserve-amount"
                className="h-11"
                inputMode="decimal"
                value={actionForm.amount}
                onChange={(e) =>
                  setActionForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-reserve-description">
                Descrição
              </Label>

              <Input
                id="edit-reserve-description"
                className="h-11"
                value={actionForm.description}
                onChange={(e) =>
                  setActionForm((prev) => ({
                    ...prev,
                    description:
                      e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-reserve-date">
                Data
              </Label>

              <Input
                id="edit-reserve-date"
                type="date"
                className="h-11"
                value={actionForm.date}
                onChange={(e) =>
                  setActionForm((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="h-11 w-full"
              onClick={() => void handleEdit()}
              disabled={saveTransaction.isPending}
            >
              {saveTransaction.isPending
                ? "Salvando..."
                : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* META */}

      <Dialog
        open={showTargetDialog}
        onOpenChange={setShowTargetDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Meta da reserva
            </DialogTitle>

            <DialogDescription>
              Defina quanto você gostaria de ter reservado.
              A meta é opcional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="reserve-target">
              Objetivo
            </Label>

            <Input
              id="reserve-target"
              className="h-11"
              inputMode="decimal"
              placeholder="3.000,00"
              value={target}
              onChange={(e) =>
                setTarget(e.target.value)
              }
              autoFocus
            />

            {target ? (
              <p className="text-xs text-muted-foreground">
                Meta: {formatBRL(targetValue)}
              </p>
            ) : null}
          </div>

          <DialogFooter className="flex-col sm:flex-row">
            {targetValue > 0 ? (
              <Button
                variant="ghost"
                className="h-11"
                onClick={() => setTarget("")}
              >
                Remover meta
              </Button>
            ) : null}

            <Button
              className="h-11"
              onClick={() => void saveTarget()}
              disabled={saveReserve.isPending}
            >
              {saveReserve.isPending
                ? "Salvando..."
                : "Salvar meta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EXCLUIR */}

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
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
              onClick={() => void confirmDelete()}
              disabled={
                deleteTransaction.isPending
              }
            >
              {deleteTransaction.isPending
                ? "Excluindo..."
                : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}