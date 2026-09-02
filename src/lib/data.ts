import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

/* =========================================================
   TIPOS
   ========================================================= */

export type Transaction = Tables["transactions"]["Row"];

export type Account = Tables["accounts"]["Row"];

export type TransactionInput = {
  type: "entrada" | "saida";
  description: string;
  amount: number;
  category: string;
  date?: string;
  note?: string | null;
  account_id?: string | null;
};

export type AccountInput = {
  name: string;
  type?: string;
  initial_balance?: number;
  balance_adjustment?: number;
};

/* =========================================================
   USUÁRIO ATUAL
   ========================================================= */

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  return user.id;
}

/* =========================================================
   TRANSAÇÕES
   ========================================================= */

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],

    queryFn: async (): Promise<Transaction[]> => {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

/* =========================================================
   SALVAR TRANSAÇÃO
   ========================================================= */

export function useSaveTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: TransactionInput;
    }) => {
      const userId = await getCurrentUserId();

      const payload = {
        user_id: userId,
        type: values.type,
        description: values.description,
        amount: values.amount,
        category: values.category,
        date:
          values.date ??
          new Date().toISOString().slice(0, 10),
        note: values.note ?? null,
        account_id: values.account_id ?? null,
        is_demo: false,
      };

      if (id) {
        const { data, error } = await supabase
          .from("transactions")
          .update(payload)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
}

/* =========================================================
   EXCLUIR TRANSAÇÃO
   ========================================================= */

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = await getCurrentUserId();

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
}

/* =========================================================
   CONTAS
   ========================================================= */

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],

    queryFn: async (): Promise<Account[]> => {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

/* =========================================================
   CRIAR CONTA
   ========================================================= */

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: AccountInput) => {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from("accounts")
        .insert({
          user_id: userId,
          name: values.name.trim().slice(0, 100),
          type: values.type ?? "conta",
          initial_balance: values.initial_balance ?? 0,
          balance_adjustment: values.balance_adjustment ?? 0,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
}

/* =========================================================
   EDITAR / CRIAR CONTA
   ========================================================= */

export function useSaveAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: AccountInput;
    }) => {
      const userId = await getCurrentUserId();

      const payload = {
        name: values.name.trim().slice(0, 100),
        type: values.type ?? "conta",
        initial_balance: values.initial_balance ?? 0,
        balance_adjustment: values.balance_adjustment ?? 0,
      };

      if (id) {
        const { data, error } = await supabase
          .from("accounts")
          .update(payload)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      }

      const { data, error } = await supabase
        .from("accounts")
        .insert({
          user_id: userId,
          ...payload,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
}

/* =========================================================
   EXCLUIR CONTA
   ========================================================= */

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = await getCurrentUserId();

      /*
       * Desvincula as transações da conta.
       * As transações continuam existindo.
       */

      const { error: unlinkError } = await supabase
        .from("transactions")
        .update({
          account_id: null,
        })
        .eq("account_id", id)
        .eq("user_id", userId);

      if (unlinkError) {
        throw unlinkError;
      }

      /*
       * Exclui a conta.
       */

      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    },
  });
}

/* =========================================================
   SALDOS
   ========================================================= */

export type AccountWithBalance = Account & {
  calculatedBalance: number;
  transactionBalance: number;
};

export function useAccountsWithBalances() {
  const accountsQuery = useAccounts();

  const transactionsQuery = useTransactions();

  const accounts = accountsQuery.data ?? [];

  const transactions = transactionsQuery.data ?? [];

  const data = accounts.map(
    (account): AccountWithBalance => {
      const transactionBalance = transactions.reduce(
        (total, transaction) => {
          if (
            transaction.account_id !== account.id
          ) {
            return total;
          }

          const amount = Number(
            transaction.amount,
          );

          if (!Number.isFinite(amount)) {
            return total;
          }

          if (
            transaction.type === "entrada"
          ) {
            return total + amount;
          }

          return total - amount;
        },
        0,
      );

      const initialBalance = Number(
        account.initial_balance,
      );

      const balanceAdjustment = Number(
        account.balance_adjustment,
      );

      const safeInitialBalance =
        Number.isFinite(initialBalance)
          ? initialBalance
          : 0;

      const safeBalanceAdjustment =
        Number.isFinite(balanceAdjustment)
          ? balanceAdjustment
          : 0;

      const calculatedBalance =
        safeInitialBalance +
        safeBalanceAdjustment +
        transactionBalance;

      return {
        ...account,
        transactionBalance,
        calculatedBalance,
      };
    },
  );

  return {
    ...accountsQuery,

    data,

    isLoading:
      accountsQuery.isLoading ||
      transactionsQuery.isLoading,

    isFetching:
      accountsQuery.isFetching ||
      transactionsQuery.isFetching,

    isError:
      accountsQuery.isError ||
      transactionsQuery.isError,

    error:
      accountsQuery.error ??
      transactionsQuery.error ??
      null,
  };
}

/* =========================================================
   SALDO TOTAL
   ========================================================= */

export function useTotalAccountBalance() {
  const {
    data: accounts = [],
    ...query
  } = useAccountsWithBalances();

  const total = accounts.reduce(
    (sum, account) =>
      sum + account.calculatedBalance,
    0,
  );

  return {
    ...query,
    data: total,
  };
}

/* =========================================================
   METAS
   ========================================================= */

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],

    queryFn: async () => {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

/* =========================================================
   INVESTIMENTOS
   ========================================================= */

export function useInvestments() {
  return useQuery({
    queryKey: ["investments"],

    queryFn: async () => {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", userId)
        .order("date", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

/* =========================================================
   RESERVAS
   ========================================================= */

export function useReserves() {
  return useQuery({
    queryKey: ["reserves"],

    queryFn: async () => {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from("reserves")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

/* =========================================================
   PLANEJAMENTO MENSAL
   ========================================================= */

export function useMonthlyPlans(
  month?: string,
) {
  return useQuery({
    queryKey: [
      "monthly_plans",
      month ?? null,
    ],

    queryFn: async () => {
      const userId = await getCurrentUserId();

      let query = supabase
        .from("monthly_plans")
        .select("*")
        .eq("user_id", userId);

      if (month) {
        query = query.eq(
          "month",
          month,
        );
      }

      const { data, error } = await query.order(
        "category",
        {
          ascending: true,
        },
      );

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

/* =========================================================
   PLANEJAMENTO DE SALÁRIO
   ========================================================= */

export function useSalaryPlans(
  month?: string,
) {
  return useQuery({
    queryKey: [
      "salary_plans",
      month ?? null,
    ],

    queryFn: async () => {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from("salary_plans")
        .select("*")
        .eq("user_id", userId)
        .order("month", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

/* =========================================================
   PERFIL
   ========================================================= */

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],

    queryFn: async () => {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
  });
}

/* =========================================================
   CONFIGURAÇÕES DO USUÁRIO
   ========================================================= */

export function useUserSettings() {
  return useQuery({
    queryKey: ["user_settings"],

    queryFn: async () => {
      const userId = await getCurrentUserId();

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
  });
}

/* =========================================================
   REEXPORTS
   ========================================================= */

export {
  useUser,
  useUpdateProfile,
  useInvalidateFinance,
  useSaveGoal,
  useDeleteGoal,
  useSaveInvestment,
  useDeleteInvestment,
  useReserve,
  useSaveReserve,
  useSaveMonthlyLimit,
  useSalaryPlan,
  useSaveSalaryPlan,
  useDemoData,
} from "./hooks";