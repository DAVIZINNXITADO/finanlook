import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
   USUÁRIO
========================================================= */

export function useUser() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } =
        await supabase.auth.getUser();

      return data.user ?? null;
    },
    staleTime: 30_000,
  });
}

async function requireUserId(): Promise<string> {
  const { data } =
    await supabase.auth.getUser();

  if (!data.user) {
    throw new Error(
      "Sessão expirada. Entre novamente.",
    );
  }

  return data.user.id;
}

/* =========================================================
   PERFIL
========================================================= */

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn:
      async (): Promise<Profile | null> => {
        const { data: auth } =
          await supabase.auth.getUser();

        if (!auth.user) return null;

        const { data, error } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", auth.user.id)
            .maybeSingle();

        if (error) throw error;

        return data;
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
      const { data, error } =
        await supabase
          .from("accounts")
          .select("*")
          .order("created_at", {
            ascending: true,
          });

      if (error) throw error;

      return data ?? [];
    },
  });
}

export type AccountInput = {
  name: string;
  type:
    | "conta"
    | "carteira"
    | "poupanca"
    | "investimento"
    | "outro";
  initial_balance: number;
  balance_adjustment: number;
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
      const user_id =
        await requireUserId();

      if (id) {
        const { error } =
          await supabase
            .from("accounts")
            .update(values)
            .eq("id", id)
            .eq("user_id", user_id);

        if (error) throw error;

        return;
      }

      const { error } =
        await supabase
          .from("accounts")
          .insert({
            ...values,
            user_id,
          });

      if (error) throw error;
    },

    onSuccess: invalidate,
  });
}

export function useDeleteAccount() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async (
      id: string,
    ) => {
      const user_id =
        await requireUserId();

      /*
       * As movimentações não são apagadas.
       * O account_id vira NULL por causa do
       * ON DELETE SET NULL da migration.
       */
      const { error } =
        await supabase
          .from("accounts")
          .delete()
          .eq("id", id)
          .eq("user_id", user_id);

      if (error) throw error;
    },

    onSuccess: invalidate,
  });
}

/* =========================================================
   MOVIMENTAÇÕES
========================================================= */

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],

    queryFn:
      async (): Promise<Transaction[]> => {
        const { data, error } =
          await supabase
            .from("transactions")
            .select("*")
            .order("date", {
              ascending: false,
            })
            .order("created_at", {
              ascending: false,
            });

        if (error) throw error;

        return data ?? [];
      },
  });
}

export type TransactionInput = {
  type: "entrada" | "saida";
  description: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  account_id?: string | null;
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
      values: TransactionInput;
    }) => {
      const user_id =
        await requireUserId();

      /*
       * Se uma conta foi selecionada,
       * confirma que ela pertence ao usuário.
       */
      if (values.account_id) {
        const { data: account, error } =
          await supabase
            .from("accounts")
            .select("id")
            .eq(
              "id",
              values.account_id,
            )
            .eq("user_id", user_id)
            .maybeSingle();

        if (error) throw error;

        if (!account) {
          throw new Error(
            "A conta selecionada não existe.",
          );
        }
      }

      if (id) {
        const { error } =
          await supabase
            .from("transactions")
            .update({
              type: values.type,
              description:
                values.description,
              amount: values.amount,
              category:
                values.category,
              date: values.date,
              note: values.note,
              account_id:
                values.account_id ??
                null,
            })
            .eq("id", id)
            .eq(
              "user_id",
              user_id,
            );

        if (error) throw error;

        return;
      }

      const { error } =
        await supabase
          .from("transactions")
          .insert({
            type: values.type,
            description:
              values.description,
            amount: values.amount,
            category:
              values.category,
            date: values.date,
            note: values.note,
            account_id:
              values.account_id ??
              null,
            user_id,
          });

      if (error) throw error;
    },

    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async (
      id: string,
    ) => {
      const user_id =
        await requireUserId();

      const { error } =
        await supabase
          .from("transactions")
          .delete()
          .eq("id", id)
          .eq(
            "user_id",
            user_id,
          );

      if (error) throw error;
    },

    onSuccess: invalidate,
  });
}

/* =========================================================
   SALDO DE UMA CONTA
========================================================= */

export function calculateAccountBalance(
  account: Account,
  transactions: Transaction[],
): number {
  const movementBalance =
    transactions.reduce(
      (total, transaction) => {
        if (
          transaction.account_id !==
          account.id
        ) {
          return total;
        }

        const amount = Number(
          transaction.amount,
        );

        if (
          !Number.isFinite(amount)
        ) {
          return total;
        }

        return (
          total +
          (transaction.type ===
          "entrada"
            ? amount
            : -amount)
        );
      },
      0,
    );

  return (
    Number(account.initial_balance) +
    Number(account.balance_adjustment) +
    movementBalance
  );
}

/* =========================================================
   SALDO DE TODAS AS CONTAS
========================================================= */

export function calculateAccountsBalance(
  accounts: Account[],
  transactions: Transaction[],
): number {
  return accounts.reduce(
    (total, account) =>
      total +
      calculateAccountBalance(
        account,
        transactions,
      ),
    0,
  );
}

/* =========================================================
   AJUSTE MANUAL DE SALDO
========================================================= */

export function useAdjustAccountBalance() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async ({
      accountId,
      adjustment,
    }: {
      accountId: string;
      adjustment: number;
    }) => {
      const user_id =
        await requireUserId();

      const { error } =
        await supabase
          .from("accounts")
          .update({
            balance_adjustment:
              adjustment,
          })
          .eq(
            "id",
            accountId,
          )
          .eq(
            "user_id",
            user_id,
          );

      if (error) throw error;
    },

    onSuccess: invalidate,
  });
}

/* =========================================================
   METAS
========================================================= */

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn:
      async (): Promise<Goal[]> => {
        const { data, error } =
          await supabase
            .from("goals")
            .select("*")
            .order("created_at", {
              ascending: false,
            });

        if (error) throw error;

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
        name: string;
        target_amount: number;
        saved_amount: number;
        deadline: string | null;
      };
    }) => {
      const user_id =
        await requireUserId();

      if (id) {
        const { error } =
          await supabase
            .from("goals")
            .update(values)
            .eq("id", id)
            .eq(
              "user_id",
              user_id,
            );

        if (error) throw error;

        return;
      }

      const { error } =
        await supabase
          .from("goals")
          .insert({
            ...values,
            user_id,
          });

      if (error) throw error;
    },

    onSuccess: invalidate,
  });
}

export function useDeleteGoal() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async (
      id: string,
    ) => {
      const user_id =
        await requireUserId();

      const { error } =
        await supabase
          .from("goals")
          .delete()
          .eq("id", id)
          .eq(
            "user_id",
            user_id,
          );

      if (error) throw error;
    },

    onSuccess: invalidate,
  });
}

/* =========================================================
   INVESTIMENTOS
========================================================= */

export function useInvestments() {
  return useQuery({
    queryKey: ["investments"],
    queryFn:
      async (): Promise<
        Investment[]
      > => {
        const { data, error } =
          await supabase
            .from("investments")
            .select("*")
            .order("date", {
              ascending: false,
            });

        if (error) throw error;

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
        name: string;
        amount: number;
        date: string;
        note: string | null;
      };
    }) => {
      const user_id =
        await requireUserId();

      if (id) {
        const { error } =
          await supabase
            .from("investments")
            .update(values)
            .eq("id", id)
            .eq(
              "user_id",
              user_id,
            );

        if (error) throw error;

        return;
      }

      const { error } =
        await supabase
          .from("investments")
          .insert({
            ...values,
            user_id,
          });

      if (error) throw error;
    },

    onSuccess: invalidate,
  });
}

export function useDeleteInvestment() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn: async (
      id: string,
    ) => {
      const user_id =
        await requireUserId();

      const { error } =
        await supabase
          .from("investments")
          .delete()
          .eq("id", id)
          .eq(
            "user_id",
            user_id,
          );

      if (error) throw error;
    },

    onSuccess: invalidate,
  });
}

/* =========================================================
   RESERVA
========================================================= */

export function useReserve() {
  return useQuery({
    queryKey: ["reserve"],
    queryFn:
      async (): Promise<
        Reserve | null
      > => {
        const { data, error } =
          await supabase
            .from("reserves")
            .select("*")
            .maybeSingle();

        if (error) throw error;

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
        target_amount: number;
        current_amount: number;
      },
    ) => {
      const user_id =
        await requireUserId();

      const { error } =
        await supabase
          .from("reserves")
          .upsert(
            {
              ...values,
              user_id,
            },
            {
              onConflict:
                "user_id",
            },
          );

      if (error) throw error;
    },

    onSuccess: invalidate,
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

    queryFn:
      async (): Promise<
        MonthlyPlan[]
      > => {
        const { data, error } =
          await supabase
            .from("monthly_plans")
            .select("*")
            .eq(
              "month",
              month,
            )
            .order(
              "category",
            );

        if (error) throw error;

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
      category: string;
      limit: number;
    }) => {
      const user_id =
        await requireUserId();

      if (limit <= 0) {
        const { error } =
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
              user_id,
            );

        if (error) throw error;

        return;
      }

      const { error } =
        await supabase
          .from(
            "monthly_plans",
          )
          .upsert(
            {
              user_id,
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

      if (error) throw error;
    },

    onSuccess: invalidate,
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

    queryFn:
      async (): Promise<
        SalaryPlan | null
      > => {
        const { data, error } =
          await supabase
            .from("salary_plans")
            .select("*")
            .eq(
              "month",
              month,
            )
            .maybeSingle();

        if (error) throw error;

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
      income: number;
      allocations: Record<
        string,
        number
      >;
    }) => {
      const user_id =
        await requireUserId();

      const { error } =
        await supabase
          .from("salary_plans")
          .upsert(
            {
              user_id,
              month,
              income,
              allocations,
            },
            {
              onConflict:
                "user_id,month",
            },
          );

      if (error) throw error;

      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .update({
          monthly_income:
            income,
        })
        .eq(
          "id",
          user_id,
        );

      if (profileError) {
        throw profileError;
      }
    },

    onSuccess: invalidate,
  });
}

/* =========================================================
   ATUALIZAR PERFIL
========================================================= */

export function useUpdateProfile() {
  const invalidate =
    useInvalidateFinance();

  return useMutation({
    mutationFn:
      async (
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
        const user_id =
          await requireUserId();

        const { error } =
          await supabase
            .from("profiles")
            .update(values)
            .eq(
              "id",
              user_id,
            );

        if (error) throw error;
      },

    onSuccess: invalidate,
  });
}

/* =========================================================
   INVALIDAÇÃO CENTRAL
========================================================= */

export function useInvalidateFinance() {
  const qc =
    useQueryClient();

  return () => {
    for (const key of [
      "accounts",
      "transactions",
      "goals",
      "investments",
      "reserve",
      "monthly-plans",
      "salary-plan",
      "profile",
    ]) {
      void qc.invalidateQueries({
        queryKey: [key],
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
        const user_id =
          await requireUserId();

        const month =
          currentMonthKey();

        const day = (
          d: number,
        ) =>
          `${month}-${String(
            d,
          ).padStart(2, "0")}`;

        /*
         * Cria uma conta de demonstração.
         */
        const {
          data: account,
          error:
            accountError,
        } = await supabase
          .from("accounts")
          .insert({
            user_id,
            name: "Conta principal",
            type: "conta",
            initial_balance: 0,
            balance_adjustment: 0,
          })
          .select()
          .single();

        if (accountError)
          throw accountError;

        const rows = [
          {
            type: "entrada",
            description:
              "Salário",
            amount: 2500,
            category:
              "Salário",
            date: day(5),
          },
          {
            type: "saida",
            description:
              "Mercado do mês",
            amount: 350,
            category:
              "Alimentação",
            date: day(6),
          },
          {
            type: "saida",
            description:
              "Transporte",
            amount: 200,
            category:
              "Transporte",
            date: day(8),
          },
          {
            type: "saida",
            description:
              "Cinema e passeios",
            amount: 150,
            category:
              "Lazer",
            date: day(12),
          },
          {
            type: "saida",
            description:
              "Contas de casa",
            amount: 400,
            category:
              "Contas",
            date: day(10),
          },
          {
            type: "saida",
            description:
              "Reserva de emergência",
            amount: 300,
            category:
              "Reserva de emergência",
            date: day(15),
          },
        ] as const;

        const {
          error:
            transactionError,
        } = await supabase
          .from("transactions")
          .insert(
            rows.map(
              (row) => ({
                ...row,
                user_id,
                account_id:
                  account.id,
                is_demo: true,
                note:
                  "Dado de demonstração",
              }),
            ),
          );

        if (transactionError)
          throw transactionError;

        const {
          error: goalError,
        } = await supabase
          .from("goals")
          .insert({
            user_id,
            name:
              "Comprar notebook",
            target_amount: 3000,
            saved_amount: 1200,
            is_demo: true,
          });

        if (goalError)
          throw goalError;

        const {
          error:
            reserveError,
        } = await supabase
          .from("reserves")
          .upsert(
            {
              user_id,
              target_amount: 3000,
              current_amount: 300,
            },
            {
              onConflict:
                "user_id",
            },
          );

        if (reserveError)
          throw reserveError;
      },

      onSuccess: invalidate,
    });

  const remove =
    useMutation({
      mutationFn: async () => {
        const user_id =
          await requireUserId();

        /*
         * Remove movimentações demo.
         */
        const {
          error:
            transactionError,
        } = await supabase
          .from("transactions")
          .delete()
          .eq(
            "user_id",
            user_id,
          )
          .eq(
            "is_demo",
            true,
          );

        if (transactionError)
          throw transactionError;

        /*
         * Remove metas demo.
         */
        const {
          error: goalError,
        } = await supabase
          .from("goals")
          .delete()
          .eq(
            "user_id",
            user_id,
          )
          .eq(
            "is_demo",
            true,
          );

        if (goalError)
          throw goalError;

        /*
         * Remove investimentos demo.
         */
        const {
          error:
            investError,
        } = await supabase
          .from("investments")
          .delete()
          .eq(
            "user_id",
            user_id,
          )
          .eq(
            "is_demo",
            true,
          );

        if (investError)
          throw investError;

        /*
         * Remove a conta demo somente se ela
         * estiver sem movimentações.
         *
         * Como as movimentações demo já foram
         * apagadas, podemos procurar pela conta
         * chamada "Conta principal".
         */
        const {
          data: demoAccounts,
          error:
            accountFindError,
        } = await supabase
          .from("accounts")
          .select("id")
          .eq(
            "user_id",
            user_id,
          )
          .eq(
            "name",
            "Conta principal",
          );

        if (accountFindError)
          throw accountFindError;

        if (
          demoAccounts &&
          demoAccounts.length > 0
        ) {
          for (const account of demoAccounts) {
            const {
              error:
                accountDeleteError,
            } = await supabase
              .from("accounts")
              .delete()
              .eq(
                "id",
                account.id,
              )
              .eq(
                "user_id",
                user_id,
              );

            if (
              accountDeleteError
            ) {
              throw accountDeleteError;
            }
          }
        }
      },

      onSuccess: invalidate,
    });

  return {
    create,
    remove,
  };
}

/* =========================================================
   DATA PADRÃO
========================================================= */

export const DEFAULT_DATE =
  todayISO;