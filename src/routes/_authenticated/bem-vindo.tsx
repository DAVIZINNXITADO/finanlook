import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, CalendarRange, ChartPie, LifeBuoy, Target, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemoData, useProfile, useUpdateProfile } from "@/lib/data";
import { formatBRL, parseAmount } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/bem-vindo")({
  head: () => ({
    meta: [
      { title: "Bem-vindo ao FinanFácil" },
      { name: "description", content: "Primeiros passos para organizar seu dinheiro no FinanFácil." },
      { property: "og:title", content: "Bem-vindo ao FinanFácil" },
      { property: "og:description", content: "Primeiros passos no FinanFácil." },
    ],
  }),
  component: Welcome,
});

const GUIDE = [
  {
    icon: Wallet,
    title: "1. Registre entradas e gastos",
    text: "Em Movimentações você anota o que recebeu e o que gastou. É a base de tudo.",
  },
  {
    icon: ChartPie,
    title: "2. Veja a Visão geral",
    text: "Saldo, entradas, gastos e quanto você guardou, com gráficos por categoria.",
  },
  {
    icon: CalendarRange,
    title: "3. Organize seu salário e limites",
    text: "Distribua sua renda entre categorias e defina limites mensais sem travas.",
  },
  {
    icon: LifeBuoy,
    title: "4. Monte sua reserva",
    text: "Uma reserva de emergência é um valor separado para despesas inesperadas.",
  },
  {
    icon: Target,
    title: "5. Crie metas",
    text: "Notebook, viagem, curso: acompanhe quanto falta para conquistar.",
  },
];

function Welcome() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const demo = useDemoData();
  const [income, setIncome] = useState("");

  async function finish(withIncome: boolean) {
    const value = withIncome ? parseAmount(income) : null;
    await updateProfile.mutateAsync({
      onboarded: true,
      ...(value && value > 0 ? { monthly_income: value } : {}),
    });
    navigate({ to: "/visao-geral" });
  }

  async function loadDemo() {
    try {
      await demo.create.mutateAsync();
      await updateProfile.mutateAsync({ onboarded: true });
      toast.success("Dados de demonstração adicionados!");
      navigate({ to: "/visao-geral" });
    } catch {
      toast.error("Não foi possível criar os dados de demonstração.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="surface hero-gradient px-6 py-10 text-primary-foreground">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          Bem-vindo ao FinanFácil, {profile?.name?.split(" ")[0] || "tudo bem"}! 👋
        </h1>
        <p className="mt-2 max-w-lg text-sm opacity-90">
          Vamos organizar seu dinheiro de forma simples.
        </p>
      </section>

      <section className="surface p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Qual é sua renda mensal?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          É opcional. Se você informar, usamos esse valor no Organizador de salário.
        </p>
        <div className="mt-4 max-w-xs space-y-1.5">
          <Label htmlFor="income">Renda mensal</Label>
          <Input
            id="income"
            inputMode="decimal"
            placeholder="2500,00"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="h-11"
          />
          {income ? (
            <p className="text-xs text-muted-foreground">{formatBRL(parseAmount(income))}</p>
          ) : null}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button className="h-11" onClick={() => void finish(true)} disabled={updateProfile.isPending}>
            Começar <ArrowRight className="size-4" />
          </Button>
          <Button variant="ghost" className="h-11" onClick={() => void finish(false)}>
            Pular por enquanto
          </Button>
        </div>
      </section>

      <section className="surface p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Como usar o FinanFácil</h2>
        <ul className="mt-4 space-y-4">
          {GUIDE.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Quer ver o app com dados de exemplo?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Criamos algumas movimentações fictícias para você explorar. Estes são dados de
          demonstração e podem ser apagados a qualquer momento em Configurações.
        </p>
        <Button
          variant="secondary"
          className="mt-4 h-11"
          onClick={() => void loadDemo()}
          disabled={demo.create.isPending}
        >
          Usar dados de demonstração
        </Button>
      </section>
    </div>
  );
}
