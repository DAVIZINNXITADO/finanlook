import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/PageHeader";
import { useReserve, useSaveReserve, useTransactions } from "@/lib/data";
import { formatBRL, formatDateBR, parseAmount } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/reserva")({
  head: () => ({
    meta: [
      { title: "Minha reserva — FinanFácil" },
      {
        name: "description",
        content: "Defina o objetivo da sua reserva de emergência e acompanhe o progresso.",
      },
      { property: "og:title", content: "Minha reserva — FinanFácil" },
      { property: "og:description", content: "Acompanhe sua reserva de emergência." },
    ],
  }),
  component: ReservePage,
});

function ReservePage() {
  const { data: reserve, isLoading } = useReserve();
  const { data: transactions = [] } = useTransactions();
  const save = useSaveReserve();
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading || ready) return;
    setTarget(reserve?.target_amount ? String(Number(reserve.target_amount)).replace(".", ",") : "");
    setCurrent(
      reserve?.current_amount ? String(Number(reserve.current_amount)).replace(".", ",") : "",
    );
    setReady(true);
  }, [isLoading, reserve, ready]);

  const targetValue = parseAmount(target);
  const currentValue = parseAmount(current);
  const progress = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;
  const missing = Math.max(targetValue - currentValue, 0);

  const contributions = transactions.filter(
    (t) => t.type === "saida" && t.category === "Reserva de emergência",
  );
  const contributed = contributions.reduce((acc, t) => acc + Number(t.amount), 0);

  async function handleSave() {
    try {
      await save.mutateAsync({ target_amount: targetValue, current_amount: currentValue });
      toast.success("Reserva atualizada!");
    } catch {
      toast.error("Não foi possível salvar.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Minha reserva" subtitle="Sua proteção para imprevistos." />

      <p className="rounded-2xl bg-accent/60 px-4 py-3 text-sm">
        🛟 Uma reserva de emergência é um valor separado para ajudar a lidar com despesas
        inesperadas.
      </p>

      <section className="surface p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="objetivo">Objetivo da reserva</Label>
            <Input
              id="objetivo"
              inputMode="decimal"
              className="h-11"
              placeholder="3000,00"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="atual">Valor atual</Label>
            <Input
              id="atual"
              inputMode="decimal"
              className="h-11"
              placeholder="300,00"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="font-display text-xl font-semibold">
            {formatBRL(currentValue)} de {formatBRL(targetValue)}
          </p>
          <Progress value={progress} className="mt-3 h-3" />
          <p className="mt-2 text-sm text-muted-foreground">
            {targetValue <= 0
              ? "Defina um objetivo para acompanhar seu progresso."
              : missing > 0
                ? `Falta ${formatBRL(missing)} para atingir sua meta.`
                : "Parabéns! Você atingiu o objetivo da sua reserva. 🎉"}
          </p>
        </div>

        <Button className="mt-4 h-11 w-full sm:w-auto" onClick={() => void handleSave()}>
          Salvar reserva
        </Button>
      </section>

      <section className="surface p-5">
        <h2 className="font-display text-lg font-semibold">Aportes registrados</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Movimentações de saída na categoria “Reserva de emergência”. Total:{" "}
          <strong>{formatBRL(contributed)}</strong>
        </p>
        {contributions.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-5 text-center">
            <p className="text-sm text-muted-foreground">
              Você ainda não registrou aportes na reserva.
            </p>
            <Button asChild variant="secondary" className="mt-3">
              <Link to="/movimentacoes">Adicionar dinheiro à reserva</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {contributions.slice(0, 10).map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                <span className="truncate">
                  {t.description} · {formatDateBR(t.date)}
                </span>
                <span className="font-semibold">{formatBRL(t.amount)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          O FinanFácil é apenas uma ferramenta de organização. Não vendemos investimentos nem
          prometemos rentabilidade.
        </p>
      </section>
    </div>
  );
}
