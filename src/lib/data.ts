import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  supabase,
} from "@/integrations/supabase/client";

import type {
  Account,
  Goal,
  Investment,
  MonthlyPlan,
  Profile,
  Reserve,
  SalaryPlan,
  Transaction,
} from "./finance";

import {
  currentMonthKey,
  todayISO,
} from "./finance";

/* =========================================================
   USUÁRIO ATUAL
   ========================================================= */

async function requireUserId(): Promise<string> {
  const {
    data,
    error,
  } =
    await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error(
      "Sessão expirada. Entre novamente.",
    );
  }

  return data.user.id;
}

/* =========================================================
   USUÁRIO
   ========================================================= */

export function useUser() {
  return useQuery({
    queryKey: [
      "auth-user",
    ],

    queryFn: async () => {
      const {
        data,
        error,
      } =
        await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return data.user ?? null;
    },

    staleTime: 30_000,
  });
}

/* =========================================================
   PERFIL
   ========================================================= */

export function useProfile() {
  return useQuery({
    queryKey: [
      "profile",
    ],

    queryFn: async (): Promise<
      Profile | null
    > => {
      const userId =
        await requireUserId();

      const {
        data,
        error,
      } =
        await supabase
          .from("profiles")
          .select("*")
          .eq(
            "id",
            userId,
          )
          .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
  });
}

/* =========================================================
   CONTAS
   ========================================================= */

export function useAccounts() {
  return useQuery({
    queryKey: [
      "accounts",
    ],

    queryFn: async (): Promise<
      Account[]
    > => {
      const userId =
        await requireUserId();

      const {
        data,
        error,
      } =
        await supabase
          .from("accounts")
          .select("*")
          .eq(
            "user_id",
            userId,
          )
          .order(
            "created_at",
            {
              ascending:
                true,
            },
          );

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export type AccountInput = {
  name: string;
  type: string;
  initial_balance: number;
  balance_adjustment?: number;
};

export function useSaveAccount() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: AccountInput;
    }) => {
      const userId =
        await requireUserId();

      const payload = {
        name:
          values.name
            .trim()
            .slice(
              0,
              100,
            ),

        type:
          values.type,

        initial_balance:
          values.initial_balance,

        balance_adjustment:
          values.balance_adjustment ??
          0,
      };

      if (id) {
        const {
          error,
        } =
          await supabase
            .from("accounts")
            .update(payload)
            .eq(
              "id",
              id,
            )
            .eq(
              "user_id",
              userId,
            );

        if (error) {
          throw error;
        }

        return;
      }

      const {
        error,
      } =
        await supabase
          .from("accounts")
          .insert({
            ...payload,

            user_id:
              userId,
          });

      if (error) {
        throw error;
      }
    },

    onSuccess:
      invalidate,
  });
}

export function useDeleteAccount() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async (
      id: string,
    ) => {
      const userId =
        await requireUserId();

      const {
        count,
        error:
          countError,
      } =
        await supabase
          .from("transactions")
          .select(
            "id",
            {
              count:
                "exact",

              head:
                true,
            },
          )
          .eq(
            "account_id",
            id,
          )
          .eq(
            "user_id",
            userId,
          );

      if (countError) {
        throw countError;
      }

      if (
        (count ?? 0) >
        0
      ) {
        throw new Error(
          "Esta conta possui movimentações. Remova ou transfira as movimentações antes de excluir a conta.",
        );
      }

      const {
        error,
      } =
        await supabase
          .from("accounts")
          .delete()
          .eq(
            "id",
            id,
          )
          .eq(
            "user_id",
            userId,
          );

      if (error) {
        throw error;
      }
    },

    onSuccess:
      invalidate,
  });
}

/* =========================================================
   TRANSAÇÕES
   ========================================================= */

export function useTransactions() {
  return useQuery({
    queryKey: [
      "transactions",
    ],

    queryFn: async (): Promise<
      Transaction[]
    > => {
      const userId =
        await requireUserId();

      const {
        data,
        error,
      } =
        await supabase
          .from("transactions")
          .select("*")
          .eq(
            "user_id",
            userId,
          )
          .order(
            "date",
            {
              ascending:
                false,
            },
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            },
          );

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export type TransactionInput = {
  type:
    | "entrada"
    | "saida";

  description:
    string;

  amount:
    number;

  category:
    string;

  date:
    string;

  note:
    string | null;

  account_id:
    string | null;
};

export function useSaveTransaction() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values:
        TransactionInput;
    }) => {
      const userId =
        await requireUserId();

      const payload = {
        type:
          values.type,

        description:
          values.description,

        amount:
          values.amount,

        category:
          values.category,

        date:
          values.date,

        note:
          values.note,

        account_id:
          values.account_id,
      };

      if (id) {
        const {
          error,
        } =
          await supabase
            .from("transactions")
            .update(payload)
            .eq(
              "id",
              id,
            )
            .eq(
              "user_id",
              userId,
            );

        if (error) {
          throw error;
        }

        return;
      }

      const {
        error,
      } =
        await supabase
          .from("transactions")
          .insert({
            ...payload,

            user_id:
              userId,

            is_demo:
              false,
          });

      if (error) {
        throw error;
      }
    },

    onSuccess:
      invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async (
      id: string,
    ) => {
      const userId =
        await requireUserId();

      const {
        error,
      } =
        await supabase
          .from("transactions")
          .delete()
          .eq(
            "id",
            id,
          )
          .eq(
            "user_id",
            userId,
          );

      if (error) {
        throw error;
      }
    },

    onSuccess:
      invalidate,
  });
}

/* =========================================================
   SALDOS DAS CONTAS
   ========================================================= */

export type AccountWithBalance =
  Account & {
    transactionBalance:
      number;

    calculatedBalance:
      number;
  };

export function useAccountsWithBalances() {
  const accountsQuery =
    useAccounts();

  const transactionsQuery =
    useTransactions();

  const accounts =
    accountsQuery.data ??
    [];

  const transactions =
    transactionsQuery.data ??
    [];

  const data =
    accounts.map(
      (
        account,
      ): AccountWithBalance => {
        const transactionBalance =
          transactions.reduce(
            (
              total,
              transaction,
            ) => {
              if (
                transaction.account_id !==
                account.id
              ) {
                return total;
              }

              const amount =
                Number(
                  transaction.amount,
                );

              if (
                !Number.isFinite(
                  amount,
                )
              ) {
                return total;
              }

              if (
                transaction.type ===
                "entrada"
              ) {
                return (
                  total +
                  amount
                );
              }

              return (
                total -
                amount
              );
            },
            0,
          );

        const initialBalance =
          Number(
            account.initial_balance,
          );

        const balanceAdjustment =
          Number(
            account.balance_adjustment,
          );

        const safeInitialBalance =
          Number.isFinite(
            initialBalance,
          )
            ? initialBalance
            : 0;

        const safeBalanceAdjustment =
          Number.isFinite(
            balanceAdjustment,
          )
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
   SALDO TOTAL ATUAL
   ========================================================= */

export function useTotalAccountBalance() {
  const {
    data:
      accounts = [],

    ...query
  } =
    useAccountsWithBalances();

  const total =
    accounts.reduce(
      (
        sum,
        account,
      ) =>
        sum +
        account.calculatedBalance,
      0,
    );

  return {
    ...query,

    data:
      total,
  };
}

/* =========================================================
   METAS
   ========================================================= */

export function useGoals() {
  return useQuery({
    queryKey: [
      "goals",
    ],

    queryFn: async (): Promise<
      Goal[]
    > => {
      const userId =
        await requireUserId();

      const {
        data,
        error,
      } =
        await supabase
          .from("goals")
          .select("*")
          .eq(
            "user_id",
            userId,
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            },
          );

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export function useSaveGoal() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;

      values: {
        name:
          string;

        target_amount:
          number;

        saved_amount:
          number;

        deadline:
          string | null;
      };
    }) => {
      const userId =
        await requireUserId();

      if (id) {
        const {
          error,
        } =
          await supabase
            .from("goals")
            .update(values)
            .eq(
              "id",
              id,
            )
            .eq(
              "user_id",
              userId,
            );

        if (error) {
          throw error;
        }

        return;
      }

      const {
        error,
      } =
        await supabase
          .from("goals")
          .insert({
            ...values,

            user_id:
              userId,
          });

      if (error) {
        throw error;
      }
    },

    onSuccess:
      invalidate,
  });
}

export function useDeleteGoal() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async (
      id: string,
    ) => {
      const userId =
        await requireUserId();

      const {
        error,
      } =
        await supabase
          .from("goals")
          .delete()
          .eq(
            "id",
            id,
          )
          .eq(
            "user_id",
            userId,
          );

      if (error) {
        throw error;
      }
    },

    onSuccess:
      invalidate,
  });
}

/* =========================================================
   INVESTIMENTOS
   ========================================================= */

export function useInvestments() {
  return useQuery({
    queryKey: [
      "investments",
    ],

    queryFn: async (): Promise<
      Investment[]
    > => {
      const userId =
        await requireUserId();

      const {
        data,
        error,
      } =
        await supabase
          .from("investments")
          .select("*")
          .eq(
            "user_id",
            userId,
          )
          .order(
            "date",
            {
              ascending:
                false,
            },
          );

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export function useSaveInvestment() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;

      values: {
        name:
          string;

        amount:
          number;

        date:
          string;

        note:
          string | null;
      };
    }) => {
      const userId =
        await requireUserId();

      if (id) {
        const {
          error,
        } =
          await supabase
            .from("investments")
            .update(values)
            .eq(
              "id",
              id,
            )
            .eq(
              "user_id",
              userId,
            );

        if (error) {
          throw error;
        }

        return;
      }

      const {
        error,
      } =
        await supabase
          .from("investments")
          .insert({
            ...values,

            user_id:
              userId,
          });

      if (error) {
        throw error;
      }
    },

    onSuccess:
      invalidate,
  });
}

export function useDeleteInvestment() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async (
      id: string,
    ) => {
      const userId =
        await requireUserId();

      const {
        error,
      } =
        await supabase
          .from("investments")
          .delete()
          .eq(
            "id",
            id,
          )
          .eq(
            "user_id",
            userId,
          );

      if (error) {
        throw error;
      }
    },

    onSuccess:
      invalidate,
  });
}

/* =========================================================
   RESERVA DE EMERGÊNCIA
   ========================================================= */

export function useReserve() {
  return useQuery({
    queryKey: [
      "reserve",
    ],

    queryFn: async (): Promise<
      Reserve | null
    > => {
      const userId =
        await requireUserId();

      const {
        data,
        error,
      } =
        await supabase
          .from("reserves")
          .select("*")
          .eq(
            "user_id",
            userId,
          )
          .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
  });
}

export function useSaveReserve() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async (
      values: {
        target_amount:
          number;

        current_amount:
          number;
      },
    ) => {
      const userId =
        await requireUserId();

      const {
        error,
      } =
        await supabase
          .from("reserves")
          .upsert(
            {
              ...values,

              user_id:
                userId,
            },
            {
              onConflict:
                "user_id",
            },
          );

      if (error) {
        throw error;
      }
    },

    onSuccess:
      invalidate,
  });
}

/* =========================================================
   PLANEJAMENTO MENSAL
   ========================================================= */

export function useMonthlyPlans(
  month: string,
) {
  return useQuery({
    queryKey: [
      "monthly-plans",
      month,
    ],

    queryFn: async (): Promise<
      MonthlyPlan[]
    > => {
      const userId =
        await requireUserId();

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "monthly_plans",
          )
          .select("*")
          .eq(
            "user_id",
            userId,
          )
          .eq(
            "month",
            month,
          )
          .order(
            "category",
            {
              ascending:
                true,
            },
          );

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}

export function useSaveMonthlyLimit(
  month: string,
) {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async ({
      category,
      limit,
    }: {
      category:
        string;

      limit:
        number;
    }) => {
      const userId =
        await requireUserId();

      if (
        limit <=
        0
      ) {
        const {
          error,
        } =
          await supabase
            .from(
              "monthly_plans",
            )
            .delete()
            .eq(
              "month",
              month,
            )
            .eq(
              "category",
              category,
            )
            .eq(
              "user_id",
              userId,
            );

        if (error) {
          throw error;
        }

        return;
      }

      const {
        error,
      } =
        await supabase
          .from(
            "monthly_plans",
          )
          .upsert(
            {
              user_id:
                userId,

              month,

              category,

              limit_amount:
                limit,
            },
            {
              onConflict:
                "user_id,month,category",
            },
          );

      if (error) {
        throw error;
      }
    },

    onSuccess:
      invalidate,
  });
}

/* =========================================================
   PLANO DE SALÁRIO
   ========================================================= */

export function useSalaryPlan(
  month: string,
) {
  return useQuery({
    queryKey: [
      "salary-plan",
      month,
    ],

    queryFn: async (): Promise<
      SalaryPlan | null
    > => {
      const userId =
        await requireUserId();

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "salary_plans",
          )
          .select("*")
          .eq(
            "user_id",
            userId,
          )
          .eq(
            "month",
            month,
          )
          .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    },
  });
}

export function useSaveSalaryPlan(
  month: string,
) {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async ({
      income,
      allocations,
    }: {
      income:
        number;

      allocations:
        Record<
          string,
          number
        >;
    }) => {
      const userId =
        await requireUserId();

      const {
        error,
      } =
        await supabase
          .from(
            "salary_plans",
          )
          .upsert(
            {
              user_id:
                userId,

              month,

              income,

              allocations,
            },
            {
              onConflict:
                "user_id,month",
            },
          );

      if (error) {
        throw error;
      }

      const {
        error:
          profileError,
      } =
        await supabase
          .from("profiles")
          .update({
            monthly_income:
              income,
          })
          .eq(
            "id",
            userId,
          );

      if (profileError) {
        throw profileError;
      }
    },

    onSuccess:
      invalidate,
  });
}

/* =========================================================
   ATUALIZAR PERFIL
   ========================================================= */

export function useUpdateProfile() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async (
      values: Partial<
        Pick<
          Profile,
          | "name"
          | "username"
          | "monthly_income"
          | "onboarded"
        >
      >,
    ) => {
      const userId =
        await requireUserId();

      const {
        error,
      } =
        await supabase
          .from("profiles")
          .update(values)
          .eq(
            "id",
            userId,
          );

      if (error) {
        throw error;
      }
    },

    onSuccess:
      invalidate,
  });
}

/* =========================================================
   INVALIDAÇÃO DO CACHE
   ========================================================= */

export function useInvalidateFinance() {
  const queryClient =
    useQueryClient();

  return () => {
    const keys = [
      "auth-user",
      "accounts",
      "transactions",
      "goals",
      "investments",
      "reserve",
      "monthly-plans",
      "salary-plan",
      "profile",
    ];

    for (
      const key of
      keys
    ) {
      void queryClient.invalidateQueries({
        queryKey: [
          key,
        ],
      });
    }
  };
}

/* =========================================================
   DADOS DE DEMONSTRAÇÃO
   ========================================================= */

export function useDemoData() {
  const invalidate =
    useInvalidateFinance();

  const create =
    useMutation({
      mutationFn: async () => {
        const userId =
          await requireUserId();

        const month =
          currentMonthKey();

        const day =
          (value: number) =>
            `${month}-${String(
              value,
            ).padStart(
              2,
              "0",
            )}`;

        const {
          data:
            account,

          error:
            accountError,
        } =
          await supabase
            .from("accounts")
            .insert({
              user_id:
                userId,

              name: