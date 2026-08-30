import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { useProfile, useSalaryPlan, useSaveSalaryPlan } from "@/lib/data";
import {
  CHART_COLORS,
  SALARY_BUCKETS,
  currentMonthKey,
  formatBRL,
  monthLabel,
  parseAmount,
} from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/organizar-salario")({
  head: () => ({
    meta: [
      { title: "Organizar meu salário — FinanFácil" },
      {
        name: "description",
        content:
          "Distribua sua renda mensal entre necessidades, alimentação, lazer, reserva, investimentos e metas.",
      },
      { property: "og:title", content: "Organizar meu salário — FinanFácil" },
      { property: "og:description", content: "Uma sugestão simples para dividir sua renda." },
    ],
  }),
  component: SalaryPage,
});

type Allocations = Record<string, number>;

function SalaryPage() {
  const month = currentMonthKey();
  const { data: profile } = useProfile();
  const { data: plan, isLoading } = useSalaryPlan(month);
  const savePlan = useSaveSalaryPlan(month);

  const [income, setIncome] = useState("");
  const [allocations, setAllocations] = useState<Allocations>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading || ready) return;
    const baseIncome = Number(plan?.income ?? profile?.monthly_income ?? 0);
    setIncome(baseIncome > 0 ? String(baseIncome).replace(".", ",") : "");
    const stored = (plan?.allocations ?? {}) as Allocations;
    if (Object.keys(stored).length > 0) {
      setAllocations(stored);
    } else if (baseIncome > 0) {
      setAllocations(suggest(baseIncome));
    }
    setReady(true);
  }, [isLoading, plan, profile, ready]);

  const incomeValue = parseAmount(income);
  const distributed = Object.values(allocations).reduce((a, b) => a + (Number(b) || 0), 0);
  const remaining = incomeValue - distributed;

  function suggest(value: number): Allocations {
    return Object.fromEntries(
      SALARY_BUCKETS.map((b) => [b.key, Math.round(value * b.suggestion * 100) / 100]),
    );
  }

  const chartData = [
    ...SALARY_BUCKETS.map((b) => ({ name: b.key, value: Number(allocations[b.key] ?? 0) })),
    { name: "Dinheiro livre", value: Math.max(remaining, 0) },
  ].filter((d) => d.value > 0);

  async function handleSave() {
    if (incomeValue <= 0) {
      toast.error("Informe quanto você recebe por mês");
      return;
    }
    try {
      await savePlan.mutateAsync({ income: incomeValue, allocations });
      toast.success("Organização salva!");
    } catch {
      toast.error("Não foi possível salvar.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizar meu salário"
        subtitle={`Uma sugestão inicial para ${monthLabel(month)}. Você pode mudar tudo.`}
      />

      <section className="surface p-5">
        <Label htmlFor="renda" className="text-base font-semibold">
          Quanto você recebe por mês?
        </Label>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="w-full max-w-xs space-y-1.5">
            <Input
              id="renda"
              inputMode="decimal"
              className="h-12 text-lg"
              placeholder="2500,00"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{formatBRL(incomeValue)}</p>
          </div>
          <Button
            variant="secondary"
            className="h-11"
            onClick={() => setAllocations(suggest(incomeValue))}
            disabled={incomeValue <= 0}
          >
            Usar sugestão
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          A divisão é apenas uma sugestão. Nenhuma porcentagem é obrigatória.
        </p>
      </section>

      <section className="surface p-5">
        <h2 className="font-display text-lg font-semibold">Distribuição</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Renda mensal: <strong>{formatBRL(incomeValue)}</strong>
        </p>

        <div className="mt-4 space-y-3">
          {SALARY_BUCKETS.map((bucket) => (
            <div key={bucket.key} className="flex items-center gap-3">
              <span className="w-44 shrink-0 truncate text-sm font-medium">
                {bucket.emoji} {bucket.key}
              </span>
              <Input
                inputMode="decimal"
                className="h-11 max-w-[10rem]"
                value={allocations[bucket.key] ? String(allocations[bucket.key]).replace(".", ",") : ""}
                placeholder="0,00"
                onChange={(e) =>
                  setAllocations((prev) => ({ ...prev, [bucket.key]: parseAmount(e.target.value) }))
                }
              />
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {incomeValue > 0
                  ? `${Math.round(((Number(allocations[bucket.key]) || 0) / incomeValue) * 100)}%`
                  : ""}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-secondary p-4">
          <p className="text-sm">
            💰 Dinheiro restante: <strong>{formatBRL(remaining)}</strong>
          </p>
          {remaining < 0 ? (
            <p className="mt-1 text-sm font-medium text-destructive">
              A distribuição ultrapassou sua renda mensal.
            </p>
          ) : remaining > 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Você ainda tem {formatBRL(remaining)} para distribuir.
            </p>
          ) : (
            <p className="mt-1 text-sm text-success">Sua renda está totalmente distribuída.</p>
          )}
        </div>

        <Button className="mt-4 h-11 w-full sm:w-auto" onClick={() => void handleSave()}>
          Salvar organização
        </Button>
      </section>

      {chartData.length > 0 ? (
        <section className="surface p-5">
          <h2 className="font-display text-lg font-semibold">Como seu salário foi distribuído</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={86}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | string) => formatBRL(Number(value))}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2">
              {chartData.map((item, i) => (
                <li key={item.name} className="flex items-center gap-3 text-sm">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="font-medium">{formatBRL(item.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
