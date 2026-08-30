import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChartPie,
  LifeBuoy,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "FinanLook — organização financeira simples",
      },
      {
        name: "description",
        content:
          "Registre entradas e gastos, organize seu salário, monte sua reserva de emergência e acompanhe metas. Sem termos complicados.",
      },
      {
        property: "og:title",
        content: "FinanLook — organização financeira simples",
      },
      {
        property: "og:description",
        content:
          "Registre entradas e gastos, organize seu salário, monte sua reserva e acompanhe metas financeiras.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Wallet,
    title: "Entradas e gastos",
    text: "Registre em segundos e veja seu saldo real.",
  },
  {
    icon: ChartPie,
    title: "Gráficos claros",
    text: "Descubra para onde seu dinheiro está indo.",
  },
  {
    icon: LifeBuoy,
    title: "Reserva de emergência",
    text: "Monte sua proteção aos poucos.",
  },
  {
    icon: Target,
    title: "Metas",
    text: "Notebook, viagem, curso — acompanhe o progresso.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="hero-gradient flex size-9 items-center justify-center rounded-xl text-lg">
            💸
          </span>

          <span className="font-display text-lg font-semibold">
            FinanLook
          </span>
        </div>

        <Button asChild variant="ghost" size="sm">
          <Link to="/auth">Entrar</Link>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 pb-16">
        <section className="surface hero-gradient overflow-hidden px-6 py-12 text-primary-foreground sm:px-10 sm:py-16">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" />
            Simples de verdade
          </p>

          <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-5xl">
            Organize seu dinheiro sem precisar entender de finanças.
          </h1>

          <p className="mt-4 max-w-xl text-sm/relaxed opacity-90 sm:text-base">
            O FinanLook ajuda você a saber quanto entra, quanto sai, quanto
            sobra e quanto você está conseguindo guardar — tudo em uma tela só.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth" search={{ modo: "cadastro" }}>
                Criar minha conta
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
            >
              <Link to="/auth">Já tenho conta</Link>
            </Button>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="surface p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>

              <h2 className="mt-3 font-display text-base font-semibold">
                {title}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {text}
              </p>
            </div>
          ))}
        </section>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          O FinanLook é uma ferramenta de organização pessoal. Não vendemos
          investimentos nem prometemos rentabilidade.
        </p>
      </main>
    </div>
  );
}