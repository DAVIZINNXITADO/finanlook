import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Configuração central dos recursos Premium do FinanLook.
 * Toda a interface consulta esta lista — nada é duplicado nas páginas.
 */
export type PremiumFeatureKey =
  | "relatorios-avancados"
  | "analises"
  | "automacoes"
  | "planejamento-avancado"
  | "open-finance"
  | "organizacao-avancada";

export type PremiumFeature = {
  key: PremiumFeatureKey;
  title: string;
  description: string;
  emoji: string;
};

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    key: "relatorios-avancados",
    title: "Relatórios avançados",
    description:
      "Comparativos de vários meses, exportação e visões detalhadas por categoria.",
    emoji: "📊",
  },
  {
    key: "analises",
    title: "Análises financeiras",
    description:
      "Insights mais profundos sobre hábitos, tendências e oportunidades de economia.",
    emoji: "🔎",
  },
  {
    key: "automacoes",
    title: "Automações avançadas",
    description:
      "Movimentações recorrentes, lembretes e classificação automática aprimorada.",
    emoji: "⚙️",
  },
  {
    key: "planejamento-avancado",
    title: "Planejamento avançado",
    description:
      "Limites por categoria com projeções e planejamento de vários meses.",
    emoji: "🗓️",
  },
  {
    key: "open-finance",
    title: "Open Finance",
    description:
      "Conexão com instituições financeiras para importar movimentações automaticamente.",
    emoji: "🔗",
  },
  {
    key: "organizacao-avancada",
    title: "Organização avançada",
    description:
      "Categorias personalizadas e organização financeira completa em um só lugar.",
    emoji: "🧩",
  },
];

export type Plan = {
  plan: "free" | "premium";
  status: string;
  isPremium: boolean;
  currentPeriodEnd: string | null;
};

const FREE_PLAN: Plan = {
  plan: "free",
  status: "inactive",
  isPremium: false,
  currentPeriodEnd: null,
};

/**
 * Lê o plano do usuário direto do banco.
 * Enquanto o banco não confirmar uma assinatura ativa,
 * o usuário é tratado como plano gratuito.
 */
export function usePlan() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async (): Promise<Plan> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return FREE_PLAN;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", auth.user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return FREE_PLAN;

      const isPremium =
        data.plan === "premium" && data.status === "active";

      return {
        plan: isPremium ? "premium" : "free",
        status: data.status,
        isPremium,
        currentPeriodEnd: data.current_period_end,
      };
    },
    staleTime: 60_000,
  });
}

/**
 * Indica se existe um provedor de pagamento configurado.
 * Enquanto for `false`, a assinatura não pode ser processada
 * e a interface deve deixar isso claro — sem simular pagamento.
 */
export const PAYMENTS_PROVIDER_CONFIGURED = false;
