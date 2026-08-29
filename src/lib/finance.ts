import type { Database } from "@/integrations/supabase/types";

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type Investment = Database["public"]["Tables"]["investments"]["Row"];
export type Reserve = Database["public"]["Tables"]["reserves"]["Row"];
export type MonthlyPlan = Database["public"]["Tables"]["monthly_plans"]["Row"];
export type SalaryPlan = Database["public"]["Tables"]["salary_plans"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const INCOME_CATEGORIES = ["Salário", "Trabalho", "Vendas", "Outros"] as const;

export const EXPENSE_CATEGORIES = [
  "Necessidades",
  "Alimentação",
  "Moradia",
  "Transporte",
  "Saúde",
  "Educação",
  "Contas",
  "Lazer",
  "Compras",
  "Assinaturas",
  "Reserva de emergência",
  "Investimentos",
  "Metas",
  "Outros",
] as const;

/** Saídas que na verdade são dinheiro guardado, não consumo. */
export const SAVING_CATEGORIES = ["Reserva de emergência", "Investimentos", "Metas"] as const;

/** Categorias de gasto usadas no planejamento mensal (sem as de guardar dinheiro). */
export const SPENDING_CATEGORIES = EXPENSE_CATEGORIES.filter(
  (c) => !SAVING_CATEGORIES.includes(c as (typeof SAVING_CATEGORIES)[number]),
);

export const CATEGORY_EMOJI: Record<string, string> = {
  Necessidades: "🏠",
  Alimentação: "🍎",
  Moradia: "🏡",
  Transporte: "🚗",
  Saúde: "💚",
  Educação: "📚",
  Contas: "🧾",
  Lazer: "🎮",
  Compras: "🛍️",
  Assinaturas: "📺",
  "Reserva de emergência": "🛟",
  Investimentos: "📈",
  Metas: "🎯",
  Outros: "✨",
  Salário: "💼",
  Trabalho: "🛠️",
  Vendas: "🏷️",
  "Dinheiro livre": "💰",
};

export const SALARY_BUCKETS = [
  { key: "Necessidades", emoji: "🏠", suggestion: 0.3 },
  { key: "Alimentação", emoji: "🍎", suggestion: 0.15 },
  { key: "Transporte", emoji: "🚗", suggestion: 0.1 },
  { key: "Lazer", emoji: "🎮", suggestion: 0.08 },
  { key: "Reserva de emergência", emoji: "🛟", suggestion: 0.12 },
  { key: "Investimentos", emoji: "📈", suggestion: 0.1 },
  { key: "Metas", emoji: "🎯", suggestion: 0.1 },
] as const;

export function formatBRL(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

export function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/** Converte "1.250,90" ou "1250.90" em number. */
export function parseAmount(input: string): number {
  const cleaned = input
    .replace(/\s|R\$/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function currentMonthKey(): string {
  return todayISO().slice(0, 7);
}

export function monthKeyOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const name = MONTH_NAMES[(m ?? 1) - 1] ?? "";
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${y}`;
}

export function shortMonthLabel(key: string): string {
  const [, m] = key.split("-").map(Number);
  return (MONTH_NAMES[(m ?? 1) - 1] ?? "").slice(0, 3);
}

export function addMonths(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const date = new Date((y ?? 2026), (m ?? 1) - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function isSaving(category: string): boolean {
  return (SAVING_CATEGORIES as readonly string[]).includes(category);
}

export type MonthSummary = {
  income: number;
  expenses: number;
  saved: number;
  balance: number;
  savingRate: number;
  byCategory: { category: string; total: number }[];
  count: number;
};

export function summarizeMonth(transactions: Transaction[], month: string): MonthSummary {
  const rows = transactions.filter((t) => monthKeyOf(t.date) === month);
  let income = 0;
  let expenses = 0;
  let saved = 0;
  const map = new Map<string, number>();

  for (const t of rows) {
    const amount = Number(t.amount);
    if (t.type === "entrada") {
      income += amount;
      continue;
    }
    if (isSaving(t.category)) {
      saved += amount;
    } else {
      expenses += amount;
      map.set(t.category, (map.get(t.category) ?? 0) + amount);
    }
  }

  return {
    income,
    expenses,
    saved,
    balance: income - expenses - saved,
    savingRate: income > 0 ? (saved / income) * 100 : 0,
    byCategory: [...map.entries()]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total),
    count: rows.length,
  };
}

/** Saldo acumulado (todas as movimentações), entradas menos saídas. */
export function totalBalance(transactions: Transaction[]): number {
  return transactions.reduce(
    (acc, t) => acc + (t.type === "entrada" ? Number(t.amount) : -Number(t.amount)),
    0,
  );
}

export function lastMonths(count: number, from = currentMonthKey()): string[] {
  return Array.from({ length: count }, (_, i) => addMonths(from, -(count - 1 - i)));
}

export function availableMonths(transactions: Transaction[]): string[] {
  const set = new Set(transactions.map((t) => monthKeyOf(t.date)));
  set.add(currentMonthKey());
  return [...set].sort().reverse();
}

export function buildInsights(transactions: Transaction[], month = currentMonthKey()): string[] {
  const insights: string[] = [];
  const current = summarizeMonth(transactions, month);
  const previous = summarizeMonth(transactions, addMonths(month, -1));

  if (current.count === 0) return insights;

  const top = current.byCategory[0];
  if (top) {
    insights.push(`Seu maior grupo de gastos neste mês foi ${top.category} (${formatBRL(top.total)}).`);
    if (current.expenses > 0) {
      const pct = Math.round((top.total / current.expenses) * 100);
      insights.push(`${top.category} representa ${pct}% dos seus gastos do mês.`);
    }
  }

  if (previous.count > 0) {
    const diff = current.expenses - previous.expenses;
    if (Math.abs(diff) >= 1) {
      insights.push(
        diff < 0
          ? `Você gastou ${formatBRL(Math.abs(diff))} menos que no mês passado.`
          : `Você gastou ${formatBRL(diff)} mais que no mês passado.`,
      );
    }
    const savedDiff = current.saved - previous.saved;
    if (savedDiff > 0) {
      insights.push(`Você guardou ${formatBRL(savedDiff)} a mais que no mês passado.`);
    }
  }

  if (current.saved > 0) {
    let streak = 0;
    for (let i = 0; i < 6; i++) {
      const s = summarizeMonth(transactions, addMonths(month, -i));
      if (s.saved > 0) streak += 1;
      else break;
    }
    if (streak >= 2) {
      insights.push(`Você conseguiu guardar dinheiro em ${streak} meses seguidos. Continue assim!`);
    }
  }

  if (current.income > 0 && current.savingRate >= 10) {
    insights.push(
      `Sua taxa de economia deste mês é de ${current.savingRate.toFixed(0)}% da sua renda.`,
    );
  }

  return insights;
}

export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
  "var(--color-chart-8)",
];
