import type { Database } from "@/integrations/supabase/types";

/* =========================================================
   TIPOS
   ========================================================= */

export type Account =
  Database["public"]["Tables"]["accounts"]["Row"];

export type Transaction =
  Database["public"]["Tables"]["transactions"]["Row"];

export type Goal =
  Database["public"]["Tables"]["goals"]["Row"];

export type Investment =
  Database["public"]["Tables"]["investments"]["Row"];

export type Reserve =
  Database["public"]["Tables"]["reserves"]["Row"];

export type MonthlyPlan =
  Database["public"]["Tables"]["monthly_plans"]["Row"];

export type SalaryPlan =
  Database["public"]["Tables"]["salary_plans"]["Row"];

export type Profile =
  Database["public"]["Tables"]["profiles"]["Row"];

/* =========================================================
   CATEGORIAS
   ========================================================= */

export const INCOME_CATEGORIES = [
  "Salário",
  "Trabalho",
  "Vendas",
  "Outros",
] as const;

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

export const SAVING_CATEGORIES = [
  "Reserva de emergência",
  "Investimentos",
  "Metas",
] as const;

export const SPENDING_CATEGORIES =
  EXPENSE_CATEGORIES.filter(
    (category) =>
      !SAVING_CATEGORIES.includes(
        category as (typeof SAVING_CATEGORIES)[number],
      ),
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

/* =========================================================
   CONTAS
   ========================================================= */

export const ACCOUNT_TYPES = [
  {
    key: "conta",
    label: "Conta bancária",
    emoji: "🏦",
  },
  {
    key: "carteira",
    label: "Carteira",
    emoji: "👛",
  },
  {
    key: "poupanca",
    label: "Poupança",
    emoji: "🐷",
  },
  {
    key: "investimento",
    label: "Investimentos",
    emoji: "📈",
  },
  {
    key: "outro",
    label: "Outro",
    emoji: "💰",
  },
] as const;

export type AccountType =
  (typeof ACCOUNT_TYPES)[number]["key"];

export function accountTypeLabel(
  type: string,
): string {
  return (
    ACCOUNT_TYPES.find(
      (item) => item.key === type,
    )?.label ?? "Outro"
  );
}

export function accountTypeEmoji(
  type: string,
): string {
  return (
    ACCOUNT_TYPES.find(
      (item) => item.key === type,
    )?.emoji ?? "💰"
  );
}

/* =========================================================
   SALÁRIO
   ========================================================= */

export const SALARY_BUCKETS = [
  {
    key: "Necessidades",
    emoji: "🏠",
    suggestion: 0.3,
  },
  {
    key: "Alimentação",
    emoji: "🍎",
    suggestion: 0.15,
  },
  {
    key: "Transporte",
    emoji: "🚗",
    suggestion: 0.1,
  },
  {
    key: "Lazer",
    emoji: "🎮",
    suggestion: 0.08,
  },
  {
    key: "Reserva de emergência",
    emoji: "🛟",
    suggestion: 0.12,
  },
  {
    key: "Investimentos",
    emoji: "📈",
    suggestion: 0.1,
  },
  {
    key: "Metas",
    emoji: "🎯",
    suggestion: 0.1,
  },
] as const;

/* =========================================================
   FORMATAÇÃO
   ========================================================= */

export function formatBRL(
  value: number | string | null | undefined,
): string {
  const n =
    typeof value === "string"
      ? Number(value)
      : (value ?? 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

export function formatDateBR(
  isoDate: string,
): string {
  const [year, month, day] = isoDate
    .slice(0, 10)
    .split("-");

  return `${day}/${month}/${year}`;
}

export function parseAmount(
  input: string,
): number {
  const cleaned = input
    .replace(/\s|R\$/g, "")
    .replace(
      /\.(?=\d{3}(\D|$))/g,
      "",
    )
    .replace(",", ".");

  const n = Number(cleaned);

  return Number.isFinite(n) ? n : 0;
}

/* =========================================================
   DATAS
   ========================================================= */

export function todayISO(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function currentMonthKey(): string {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;
}

export function monthKeyOf(
  isoDate: string,
): string {
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
] as const;

export function monthLabel(
  key: string,
): string {
  const [year = NaN, month = NaN] = key
    .split("-")
    .map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return "Período inválido";
  }

  const name = MONTH_NAMES[month - 1] ?? "";

  return `${name.charAt(0).toUpperCase()}${name.slice(
    1,
  )} de ${year}`;
}

export function shortMonthLabel(
  key: string,
): string {
  const [, month = NaN] = key
    .split("-")
    .map(Number);

  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return "";
  }

  return (MONTH_NAMES[month - 1] ?? "").slice(
    0,
    3,
  );
}

export function addMonths(
  key: string,
  delta: number,
): string {
  const [year = NaN, month = NaN] = key
    .split("-")
    .map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month)
  ) {
    return currentMonthKey();
  }

  const date = new Date(
    year,
    month - 1 + delta,
    1,
  );

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;
}

/* =========================================================
   CLASSIFICAÇÃO
   ========================================================= */

export function isSaving(
  category: string,
): boolean {
  return (
    SAVING_CATEGORIES as readonly string[]
  ).includes(category);
}

/* =========================================================
   RESUMO MENSAL
   ========================================================= */

export type MonthSummary = {
  income: number;
  expenses: number;
  saved: number;
  balance: number;
  savingRate: number;
  byCategory: {
    category: string;
    total: number;
  }[];
  count: number;
};

export function summarizeMonth(
  transactions: Transaction[],
  month: string,
): MonthSummary {
  const rows = transactions.filter(
    (transaction) =>
      monthKeyOf(transaction.date) === month,
  );

  let income = 0;
  let expenses = 0;
  let saved = 0;

  const map = new Map<string, number>();

  for (const transaction of rows) {
    const amount = Number(
      transaction.amount,
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      continue;
    }

    if (
      transaction.type === "entrada"
    ) {
      income += amount;
      continue;
    }

    if (
      isSaving(transaction.category)
    ) {
      saved += amount;
    } else {
      expenses += amount;

      map.set(
        transaction.category,
        (map.get(
          transaction.category,
        ) ?? 0) + amount,
      );
    }
  }

  return {
    income,
    expenses,
    saved,
    balance:
      income - expenses - saved,
    savingRate:
      income > 0
        ? (saved / income) * 100
        : 0,
    byCategory: [
      ...map.entries(),
    ]
      .map(
        ([category, total]) => ({
          category,
          total,
        }),
      )
      .sort(
        (a, b) =>
          b.total - a.total,
      ),
    count: rows.length,
  };
}

/* =========================================================
   SALDO DAS TRANSAÇÕES
   ========================================================= */

export function totalBalance(
  transactions: Transaction[],
): number {
  return transactions.reduce(
    (balance, transaction) => {
      const amount = Number(
        transaction.amount,
      );

      if (
        !Number.isFinite(amount)
      ) {
        return balance;
      }

      return (
        balance +
        (transaction.type ===
        "entrada"
          ? amount
          : -amount)
      );
    },
    0,
  );
}

/* =========================================================
   SALDO DAS CONTAS
   ========================================================= */

/**
 * Calcula o saldo inicial configurado para cada conta.
 */
export function totalInitialBalance(
  accounts: Account[],
): number {
  return accounts.reduce(
    (total, account) => {
      const value = Number(
        account.initial_balance,
      );

      return Number.isFinite(value)
        ? total + value
        : total;
    },
    0,
  );
}

/**
 * Soma os ajustes manuais das contas.
 *
 * O ajuste serve justamente para quando o usuário
 * percebe que o saldo calculado não bate com o saldo
 * real do banco/carteira.
 */
export function totalBalanceAdjustment(
  accounts: Account[],
): number {
  return accounts.reduce(
    (total, account) => {
      const value = Number(
        account.balance_adjustment,
      );

      return Number.isFinite(value)
        ? total + value
        : total;
    },
    0,
  );
}

/**
 * Saldo real consolidado:
 *
 * saldo inicial
 * + movimentações
 * + ajustes manuais
 */
export function totalAccountsBalance(
  accounts: Account[],
  transactions: Transaction[],
): number {
  return (
    totalInitialBalance(accounts) +
    totalBalance(transactions) +
    totalBalanceAdjustment(accounts)
  );
}

/**
 * Saldo calculado de uma conta específica.
 *
 * Se as transações ainda não estiverem vinculadas
 * a uma conta, elas não entram neste cálculo.
 */
export function accountBalance(
  account: Account,
  transactions: Transaction[],
): number {
  const accountTransactions =
    transactions.filter(
      (transaction) =>
        transaction.account_id ===
        account.id,
    );

  return (
    Number(account.initial_balance) +
    totalBalance(accountTransactions) +
    Number(account.balance_adjustment)
  );
}

/* =========================================================
   MESES
   ========================================================= */

export function lastMonths(
  count: number,
  from = currentMonthKey(),
): string[] {
  if (count <= 0) return [];

  return Array.from(
    { length: count },
    (_, index) =>
      addMonths(
        from,
        -(count - 1 - index),
      ),
  );
}

export function availableMonths(
  transactions: Transaction[],
): string[] {
  const set = new Set<string>();

  for (const transaction of transactions) {
    const month =
      monthKeyOf(transaction.date);

    if (
      /^\d{4}-\d{2}$/.test(month)
    ) {
      set.add(month);
    }
  }

  set.add(currentMonthKey());

  return [...set].sort().reverse();
}

/* =========================================================
   INSIGHTS
   ========================================================= */

function percentageChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return current > 0 ? null : 0;
  }

  return (
    ((current - previous) /
      Math.abs(previous)) *
    100
  );
}

export function buildInsights(
  transactions: Transaction[],
  month = currentMonthKey(),
): string[] {
  const insights: string[] = [];

  const current =
    summarizeMonth(
      transactions,
      month,
    );

  const previous =
    summarizeMonth(
      transactions,
      addMonths(month, -1),
    );

  if (current.count === 0) {
    return insights;
  }

  const top =
    current.byCategory[0];

  if (top) {
    insights.push(
      `Seu maior grupo de gastos neste mês foi ${top.category} (${formatBRL(
        top.total,
      )}).`,
    );

    if (current.expenses > 0) {
      const pct = Math.round(
        (top.total /
          current.expenses) *
          100,
      );

      insights.push(
        `${top.category} representa ${pct}% dos seus gastos do mês.`,
      );
    }
  }

  if (previous.count > 0) {
    const expenseDiff =
      current.expenses -
      previous.expenses;

    if (
      Math.abs(expenseDiff) >= 1
    ) {
      insights.push(
        expenseDiff < 0
          ? `Você gastou ${formatBRL(
              Math.abs(
                expenseDiff,
              ),
            )} menos que no mês passado.`
          : `Você gastou ${formatBRL(
              expenseDiff,
            )} mais que no mês passado.`,
      );
    }

    const expensePct =
      percentageChange(
        current.expenses,
        previous.expenses,
      );

    if (
      expensePct !== null &&
      Math.abs(expensePct) >= 10
    ) {
      insights.push(
        expensePct < 0
          ? `Seus gastos caíram ${Math.round(
              Math.abs(
                expensePct,
              ),
            )}% em relação ao mês passado.`
          : `Seus gastos aumentaram ${Math.round(
              expensePct,
            )}% em relação ao mês passado.`,
      );
    }

    const savedDiff =
      current.saved -
      previous.saved;

    if (savedDiff > 0) {
      insights.push(
        `Você guardou ${formatBRL(
          savedDiff,
        )} a mais que no mês passado.`,
      );
    } else if (
      savedDiff < 0 &&
      current.saved >= 0
    ) {
      insights.push(
        `Você guardou ${formatBRL(
          Math.abs(savedDiff),
        )} a menos que no mês passado.`,
      );
    }

    if (
      current.income >
      previous.income
    ) {
      insights.push(
        `Sua entrada de dinheiro aumentou ${formatBRL(
          current.income -
            previous.income,
        )} em relação ao mês passado.`,
      );
    }
  }

  if (current.saved > 0) {
    let streak = 0;

    for (
      let index = 0;
      index < 6;
      index++
    ) {
      const summary =
        summarizeMonth(
          transactions,
          addMonths(
            month,
            -index,
          ),
        );

      if (summary.saved > 0) {
        streak += 1;
      } else {
        break;
      }
    }

    if (streak >= 2) {
      insights.push(
        `Você conseguiu guardar dinheiro em ${streak} meses seguidos. Continue assim!`,
      );
    }
  }

  if (
    current.income > 0 &&
    current.savingRate >= 10
  ) {
    insights.push(
      `Sua taxa de economia neste mês é de ${current.savingRate.toFixed(
        0,
      )}% da sua renda.`,
    );
  } else if (
    current.income > 0 &&
    current.saved > 0
  ) {
    insights.push(
      `Você já separou ${formatBRL(
        current.saved,
      )} da sua renda para guardar neste mês.`,
    );
  }

  if (
    current.income > 0 &&
    current.expenses >
      current.income
  ) {
    insights.push(
      "Seus gastos de consumo já ultrapassaram suas entradas neste mês. Vale revisar as próximas despesas.",
    );
  }

  if (
    current.income > 0 &&
    current.balance > 0 &&
    current.expenses > 0
  ) {
    insights.push(
      `Depois dos gastos e do dinheiro guardado, seu resultado do mês está positivo em ${formatBRL(
        current.balance,
      )}.`,
    );
  }

  return [
    ...new Set(insights),
  ].slice(0, 8);
}

/* =========================================================
   GRÁFICOS
   ========================================================= */

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

/* =========================================================
   DATA PADRÃO
   ========================================================= */

export const DEFAULT_DATE = todayISO;