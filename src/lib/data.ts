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

export type Transaction =
  Tables["transactions"]["Row"];

export type Account =
  Tables["accounts"]["Row"];

/* =========================================================
   TIPOS
   ========================================================= */

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

  /*
   * A conta principal pode ser alterada normalmente.
   * Esses campos controlam comportamento especial,
   * não impedem edição ou exclusão.
   */
  is_primary?: boolean;
  is_hidden?: boolean;
};

export type DeleteAccountInput = {
  id: string;

  /*
   * Se informado, todas as movimentações da conta
   * excluída serão transferidas para esta conta.
   */
  transfer_to_account_id?: string | null;
};

/* =========================================================
   USUÁRIO ATUAL
   ========================================================= */

async function getCurrentUserId(): Promise<string> {
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
 * Cria uma conta principal caso o usuário ainda não tenha
 * nenhuma marcada como principal.
 *
 * Essa conta funciona como uma conta comum:
 *
 * - pode editar
 * - pode mudar nome
 * - pode alterar saldo
 * - pode esconder
 * - pode transferir movimentações
 * - pode excluir
 *
 * "is_primary" serve apenas para identificar a conta
 * automática criada pelo FinanLook.
 */

async function ensurePrimaryAccount(
  userId: string,
): Promise<void> {
  const {
    data: existingAccount,
    error: searchError,
  } =
    await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", userId)
      .eq("is_primary", true)
      .maybeSingle();

  if (searchError) {
    throw searchError;
  }

  if (existingAccount) {
    return;
  }

  /*
   * Não existe mais conta principal.
   *
   * Criamos uma conta automática que funciona
   * como o saldo principal do aplicativo.
   */

  const {
    error: createError,
  } =
    await supabase
      .from("accounts")
      .insert({
        user_id: userId,
        name: "Saldo principal",
        type: "saldo_principal",
        initial_balance: 0,
        balance_adjustment: 0,
        is_primary: true,
        is_hidden: false,
      });

  /*
   * Se sua tabela ainda não possuir essas colunas,
   * você precisará adicioná-las no banco.
   */

  if (createError) {
    throw createError;
  }
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
          .from("transactions")
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
            .slice(0, 10),

        note:
          values.note ?? null,

        account_id:
          values.account_id ?? null,

        is_demo:
          false,
      };

      if (id) {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              "transactions",
            )
            .update(
              payload,
            )
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

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "transactions",
          )
          .insert(
            payload,
          )
          .select()
          .single();

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "transactions",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "accounts",
        ],
      });
    },
  });
}

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

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "transactions",
        ],
      });

      queryClient.invalidateQueries({
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
       * Garante que todo usuário tenha
       * uma conta principal automática.
       */

      await ensurePrimaryAccount(
        userId,
      );

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
            "is_primary",
            {
              ascending: false,
            },
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

      return data ?? [];
    },
  });
}

/* =========================================================
   SALVAR CONTA
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

      const payload = {
        user_id: userId,

        name:
          values.name,

        type:
          values.type ??
          "conta",

        initial_balance:
          values.initial_balance ??
          0,

        balance_adjustment:
          values.balance_adjustment ??
          0,

        is_primary:
          values.is_primary ??
          false,

        is_hidden:
          values.is_hidden ??
          false,
      };

      /*
       * EDITAR
       */

      if (id) {
        /*
         * Não existe bloqueio para conta principal.
         *
         * Ela pode ser:
         *
         * - renomeada
         * - alterada
         * - ter saldo modificado
         * - escondida
         */

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "accounts",
            )
            .update(
              payload,
            )
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
            "accounts",
          )
          .insert(
            payload,
          )
          .select()
          .single();

      if (error) {
        throw error;
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "accounts",
        ],
      });
    },
  });
}

/* =========================================================
   ALTERAR VISIBILIDADE
   ========================================================= */

/*
 * Serve para esconder ou mostrar uma conta.
 *
 * A conta continua existindo.
 * As movimentações continuam vinculadas.
 */

export function useToggleAccountVisibility() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      is_hidden,
    }: {
      id: string;
      is_hidden: boolean;
    }) => {
      const userId =
        await getCurrentUserId();

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "accounts",
          )
          .update({
            is_hidden,
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
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
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

/*
 * IMPORTANTE:
 *
 * A conta principal NÃO é protegida.
 *
 * O usuário pode excluí-la.
 *
 * Antes da exclusão:
 *
 * Opção 1:
 * transferir movimentações para outra conta.
 *
 * Opção 2:
 * deixar movimentações sem conta.
 */

export function useDeleteAccount() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (
      values: DeleteAccountInput,
    ) => {
      const userId =
        await getCurrentUserId();

      const {
        id,
        transfer_to_account_id,
      } =
        values;

      /*
       * Segurança:
       * impede transferir uma conta para ela mesma.
       */

      if (
        transfer_to_account_id === id
      ) {
        throw new Error(
          "Não é possível transferir movimentações para a mesma conta.",
        );
      }

      /*
       * Verifica se a conta de destino realmente pertence
       * ao usuário.
       */

      if (
        transfer_to_account_id
      ) {
        const {
          data:
            destinationAccount,
          error:
            destinationError,
        } =
          await supabase
            .from(
              "accounts",
            )
            .select(
              "id",
            )
            .eq(
              "id",
              transfer_to_account_id,
            )
            .eq(
              "user_id",
              userId,
            )
            .maybeSingle();

        if (
          destinationError
        ) {
          throw destinationError;
        }

        if (
          !destinationAccount
        ) {
          throw new Error(
            "A conta escolhida para receber as movimentações não existe.",
          );
        }
      }

      /*
       * TRANSFERE OU DESVINCULA
       */

      const {
        error:
          transactionError,
      } =
        await supabase
          .from(
            "transactions",
          )
          .update({
            account_id:
              transfer_to_account_id ??
              null,
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
        transactionError
      ) {
        throw transactionError;
      }

      /*
       * EXCLUI A CONTA.
       *
       * NÃO IMPORTA SE ELA É PRINCIPAL.
       */

      const {
        error:
          deleteError,
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

      if (
        deleteError
      ) {
        throw deleteError;
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "accounts",
        ],
      });

      queryClient.invalidateQueries({
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
      ) => {
        /*
         * Soma todas as movimentações vinculadas
         * à conta.
         */

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

              return (
                total +
                (
                  transaction.type ===
                  "entrada"
                    ? amount
                    : -amount
                )
              );
            },
            0,
          );

        /*
         * FÓRMULA DO SALDO
         *
         * Saldo inicial
         * +
         * Ajuste manual
         * +
         * Movimentações
         */

        const initialBalance =
          Number(
            account.initial_balance,
          );

        const adjustment =
          Number(
            account.balance_adjustment,
          );

        const calculatedBalance =
          (
            Number.isFinite(
              initialBalance,
            )
              ? initialBalance
              : 0
          ) +
          (
            Number.isFinite(
              adjustment,
            )
              ? adjustment
              : 0
          ) +
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

    queryFn: async () => {
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

    queryFn: async () => {
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

    queryFn: async () => {
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
      month ?? null,
    ],

    queryFn: async () => {
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
      month ?? null,
    ],

    queryFn: async () => {
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

    queryFn: async () => {
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

    queryFn: async () => {
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