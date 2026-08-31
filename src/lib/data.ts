import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  supabase,
} from "@/integrations/supabase/client";

import type {
  Database,
} from "@/integrations/supabase/types";

type Tables =
  Database["public"]["Tables"];

/* =========================================================
   TIPOS
   ========================================================= */

export type Transaction =
  Tables["transactions"]["Row"];

export type Account =
  Tables["accounts"]["Row"];

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

async function getCurrentUserId(): Promise<
  string
> {
  const {
    data: {
      user,
    },
    error,
  } =
    await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      "Usuário não autenticado.",
    );
  }

  return user.id;
}

/* =========================================================
   CONTA PRINCIPAL AUTOMÁTICA
   ========================================================= */

/*
 * Nome da conta que aparece automaticamente
 * para um usuário novo.
 *
 * Ela é uma conta normal.
 *
 * Portanto o usuário pode:
 *
 * - editar
 * - alterar saldo
 * - criar outras contas
 * - excluir
 *
 * Não existe bloqueio especial.
 */

const DEFAULT_ACCOUNT_NAME =
  "Saldo principal";

const DEFAULT_ACCOUNT_TYPE =
  "conta";

/*
 * Chave usada para saber se já tentamos criar
 * a conta automática neste navegador.
 *
 * Isso impede o seguinte problema:
 *
 * Usuário exclui todas as contas
 * ↓
 * query roda novamente
 * ↓
 * app recria Saldo principal
 *
 * Depois que o usuário já teve a primeira conta,
 * o app não recria automaticamente.
 */

function getDefaultAccountStorageKey(
  userId: string,
) {
  return `finanlook-default-account-created-${userId}`;
}

function hasCreatedDefaultAccount(
  userId: string,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  return (
    window.localStorage.getItem(
      getDefaultAccountStorageKey(
        userId,
      ),
    ) === "true"
  );
}

function markDefaultAccountCreated(
  userId: string,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    getDefaultAccountStorageKey(
      userId,
    ),
    "true",
  );
}

/*
 * Cria a primeira conta automática.
 *
 * Só é usada quando:
 *
 * - usuário não possui nenhuma conta
 * - e a conta automática ainda nunca foi criada
 */
async function createDefaultAccount(
  userId: string,
): Promise<Account> {
  const {
    data,
    error,
  } =
    await supabase
      .from("accounts")
      .insert({
        user_id: userId,
        name:
          DEFAULT_ACCOUNT_NAME,
        type:
          DEFAULT_ACCOUNT_TYPE,
        initial_balance: 0,
        balance_adjustment: 0,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  markDefaultAccountCreated(
    userId,
  );

  return data;
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
        await getCurrentUserId();

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "transactions",
          )
          .select("*")
          .eq(
            "user_id",
            userId,
          )
          .order(
            "date",
            {
              ascending: false,
            },
          )
          .order(
            "created_at",
            {
              ascending: false,
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
   CRIAR / EDITAR TRANSAÇÃO
   ========================================================= */

export function useSaveTransaction() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: TransactionInput;
    }) => {
      const userId =
        await getCurrentUserId();

      const payload = {
        user_id: userId,

        type:
          values.type,

        description:
          values.description,

        amount:
          values.amount,

        category:
          values.category,

        date:
          values.date ??
          new Date()
            .toISOString()
            .slice(
              0,
              10,
            ),

        note:
          values.note ??
          null,

        account_id:
          values.account_id ??
          null,

        is_demo: false,
      };

      /*
       * EDITAR
       */

      if (id) {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              "transactions",
            )
            .update(payload)
            .eq(
              "id",
              id,
            )
            .eq(
              "user_id",
              userId,
            )
            .select()
            .single();

        if (error) {
          throw error;
        }

        return data;
      }

      /*
       * CRIAR
       */

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "transactions",
          )
          .insert(payload)
          .select()
          .single();

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: async () => {
      /*
       * Atualiza movimentações.
       */

      await queryClient.invalidateQueries({
        queryKey: [
          "transactions",
        ],
      });

      /*
       * Atualiza saldo das contas.
       */

      await queryClient.invalidateQueries({
        queryKey: [
          "accounts",
        ],
      });
    },
  });
}

/* =========================================================
   EXCLUIR TRANSAÇÃO
   ========================================================= */

export function useDeleteTransaction() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (
      id: string,
    ) => {
      const userId =
        await getCurrentUserId();

      const {
        error,
      } =
        await supabase
          .from(
            "transactions",
          )
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

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "transactions",
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          "accounts",
        ],
      });
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
        await getCurrentUserId();

      /*
       * Busca todas as contas.
       */

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "accounts",
          )
          .select("*")
          .eq(
            "user_id",
            userId,
          )
          .order(
            "created_at",
            {
              ascending: true,
            },
          );

      if (error) {
        throw error;
      }

      const accounts =
        data ?? [];

      /*
       * Usuário já possui contas.
       *
       * Apenas retornamos.
       */

      if (
        accounts.length > 0
      ) {
        /*
         * Marca que o usuário já passou
         * pela criação inicial.
         */

        markDefaultAccountCreated(
          userId,
        );

        return accounts;
      }

      /*
       * Não possui nenhuma conta.
       *
       * Verificamos se essa conta automática
       * já foi criada anteriormente.
       */

      if (
        hasCreatedDefaultAccount(
          userId,
        )
      ) {
        /*
         * Usuário excluiu todas as contas.
         *
         * Não recriamos.
         */

        return [];
      }

      /*
       * Usuário novo.
       *
       * Criamos Saldo principal.
       */

      const defaultAccount =
        await createDefaultAccount(
          userId,
        );

      return [
        defaultAccount,
      ];
    },

    /*
     * Evita várias requisições enquanto
     * a conta automática está sendo criada.
     */

    staleTime: 10_000,

    retry: 1,
  });
}

/* =========================================================
   CRIAR / EDITAR CONTA
   ========================================================= */

export function useSaveAccount() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: AccountInput;
    }) => {
      const userId =
        await getCurrentUserId();

      const name =
        values.name
          .trim()
          .slice(
            0,
            100,
          );

      const payload = {
        user_id:
          userId,

        name,

        type:
          values.type ??
          "conta",

        initial_balance:
          values.initial_balance ??
          0,

        balance_adjustment:
          values.balance_adjustment ??
          0,
      };

      /*
       * EDITAR CONTA
       */

      if (id) {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              "accounts",
            )
            .update({
              name:
                payload.name,

              type:
                payload.type,

              initial_balance:
                payload.initial_balance,

              balance_adjustment:
                payload.balance_adjustment,
            })
            .eq(
              "id",
              id,
            )
            .eq(
              "user_id",
              userId,
            )
            .select()
            .single();

        if (error) {
          throw error;
        }

        return data;
      }

      /*
       * CRIAR NOVA CONTA
       */

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "accounts",
          )
          .insert(payload)
          .select()
          .single();

      if (error) {
        throw error;
      }

      /*
       * Se o usuário criou uma conta manualmente,
       * consideramos que ele já passou da fase
       * inicial.
       */

      markDefaultAccountCreated(
        userId,
      );

      return data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "accounts",
        ],
      });
    },
  });
}

/* =========================================================
   EXCLUIR CONTA
   ========================================================= */

export function useDeleteAccount() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (
      id: string,
    ) => {
      const userId =
        await getCurrentUserId();

      /*
       * Primeiro removemos o vínculo
       * das movimentações.
       *
       * Elas NÃO são excluídas.
       */

      const {
        error:
          unlinkError,
      } =
        await supabase
          .from(
            "transactions",
          )
          .update({
            account_id: null,
          })
          .eq(
            "account_id",
            id,
          )
          .eq(
            "user_id",
            userId,
          );

      if (
        unlinkError
      ) {
        throw unlinkError;
      }

      /*
       * Exclui a conta.
       *
       * Não existe nenhuma proteção
       * especial para Saldo principal.
       */

      const {
        error,
      } =
        await supabase
          .from(
            "accounts",
          )
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

      /*
       * Marca que a criação automática
       * já aconteceu.
       *
       * Portanto, se o usuário excluir
       * todas as contas, o app NÃO vai
       * recriar Saldo principal.
       */

      markDefaultAccountCreated(
        userId,
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "accounts",
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          "transactions",
        ],
      });
    },
  });
}

/* =========================================================
   SALDOS DAS CONTAS
   ========================================================= */

export type AccountWithBalance =
  Account & {
    calculatedBalance: number;
    transactionBalance: number;
  };

export function useAccountsWithBalances() {
  const accountsQuery =
    useAccounts();

  const transactionsQuery =
    useTransactions();

  const accounts =
    accountsQuery.data ?? [];

  const transactions =
    transactionsQuery.data ?? [];

  const data =
    accounts.map(
      (
        account,
      ): AccountWithBalance => {
        /*
         * Soma todas as movimentações
         * vinculadas à conta.
         */

        const transactionBalance =
          transactions.reduce(
            (
              total,
              transaction,
            ) => {
              /*
               * Ignora movimentações
               * de outras contas.
               */

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

              /*
               * Proteção contra valores
               * inválidos.
               */

              if (
                !Number.isFinite(
                  amount,
                )
              ) {
                return total;
              }

              /*
               * Entrada aumenta saldo.
               */

              if (
                transaction.type ===
                "entrada"
              ) {
                return (
                  total +
                  amount
                );
              }

              /*
               * Saída diminui saldo.
               */

              return (
                total -
                amount
              );
            },
            0,
          );

        /*
         * Saldo inicial.
         */

        const initialBalance =
          Number(
            account.initial_balance,
          );

        /*
         * Ajuste manual.
         */

        const balanceAdjustment =
          Number(
            account.balance_adjustment,
          );

        /*
         * Segurança contra null/NaN.
         */

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

        /*
         * SALDO FINAL
         *
         * saldo inicial
         * +
         * ajuste manual
         * +
         * movimentações
         */

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
   SALDO TOTAL DAS CONTAS
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
   OUTROS DADOS DO FINANLOOK
   ========================================================= */

export function useGoals() {
  return useQuery({
    queryKey: [
      "goals",
    ],

    queryFn:
      async () => {
        const userId =
          await getCurrentUserId();

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "goals",
            )
            .select("*")
            .eq(
              "user_id",
              userId,
            )
            .order(
              "created_at",
              {
                ascending: false,
              },
            );

        if (error) {
          throw error;
        }

        return data ?? [];
      },
  });
}

export function useInvestments() {
  return useQuery({
    queryKey: [
      "investments",
    ],

    queryFn:
      async () => {
        const userId =
          await getCurrentUserId();

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "investments",
            )
            .select("*")
            .eq(
              "user_id",
              userId,
            )
            .order(
              "date",
              {
                ascending: false,
              },
            );

        if (error) {
          throw error;
        }

        return data ?? [];
      },
  });
}

export function useReserves() {
  return useQuery({
    queryKey: [
      "reserves",
    ],

    queryFn:
      async () => {
        const userId =
          await getCurrentUserId();

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "reserves",
            )
            .select("*")
            .eq(
              "user_id",
              userId,
            )
            .order(
              "created_at",
              {
                ascending: false,
              },
            );

        if (error) {
          throw error;
        }

        return data ?? [];
      },
  });
}

export function useMonthlyPlans(
  month?: string,
) {
  return useQuery({
    queryKey: [
      "monthly_plans",
      month ??
        null,
    ],

    queryFn:
      async () => {
        const userId =
          await getCurrentUserId();

        let query =
          supabase
            .from(
              "monthly_plans",
            )
            .select("*")
            .eq(
              "user_id",
              userId,
            );

        if (month) {
          query =
            query.eq(
              "month",
              month,
            );
        }

        const {
          data,
          error,
        } =
          await query.order(
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

export function useSalaryPlans(
  month?: string,
) {
  return useQuery({
    queryKey: [
      "salary_plans",
      month ??
        null,
    ],

    queryFn:
      async () => {
        const userId =
          await getCurrentUserId();

        let query =
          supabase
            .from(
              "salary_plans",
            )
            .select("*")
            .eq(
              "user_id",
              userId,
            );

        if (month) {
          query =
            query.eq(
              "month",
              month,
            );
        }

        const {
          data,
          error,
        } =
          await query.order(
            "month",
            {
              ascending: false,
            },
          );

        if (error) {
          throw error;
        }

        return data ?? [];
      },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: [
      "profile",
    ],

    queryFn:
      async () => {
        const userId =
          await getCurrentUserId();

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "profiles",
            )
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

export function useUserSettings() {
  return useQuery({
    queryKey: [
      "user_settings",
    ],

    queryFn:
      async () => {
        const userId =
          await getCurrentUserId();

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "user_settings",
            )
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