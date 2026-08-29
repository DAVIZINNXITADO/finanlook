import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Goal,
  Investment,
  MonthlyPlan,
  Profile,
  Reserve,
  SalaryPlan,
  Transaction,
} from "./finance";
import { currentMonthKey, todayISO } from "./finance";

export function useUser() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
    staleTime: 30_000,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useInvestments() {
  return useQuery({
    queryKey: ["investments"],
    queryFn: async (): Promise<Investment[]> => {
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useReserve() {
  return useQuery({
    queryKey: ["reserve"],
    queryFn: async (): Promise<Reserve | null> => {
      const { data, error } = await supabase.from("reserves").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMonthlyPlans(month: string) {
  return useQuery({
    queryKey: ["monthly-plans", month],
    queryFn: async (): Promise<MonthlyPlan[]> => {
      const { data, error } = await supabase
        .from("monthly_plans")
        .select("*")
        .eq("month", month)
        .order("category");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSalaryPlan(month: string) {
  return useQuery({
    queryKey: ["salary-plan", month],
    queryFn: async (): Promise<SalaryPlan | null> => {
      const { data, error } = await supabase
        .from("salary_plans")
        .select("*")
        .eq("month", month)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
  return data.user.id;
}

export function useInvalidateFinance() {
  const qc = useQueryClient();
  return () => {
    for (const key of [
      "transactions",
      "goals",
      "investments",
      "reserve",
      "monthly-plans",
      "salary-plan",
      "profile",
    ]) {
      void qc.invalidateQueries({ queryKey: [key] });
    }
  };
}

export type TransactionInput = {
  type: "entrada" | "saida";
  description: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
};

export function useSaveTransaction() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: TransactionInput }) => {
      const user_id = await requireUserId();
      if (id) {
        const { error } = await supabase.from("transactions").update(values).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("transactions").insert({ ...values, user_id });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useSaveGoal() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: { name: string; target_amount: number; saved_amount: number; deadline: string | null };
    }) => {
      const user_id = await requireUserId();
      if (id) {
        const { error } = await supabase.from("goals").update(values).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("goals").insert({ ...values, user_id });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteGoal() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useSaveInvestment() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: { name: string; amount: number; date: string; note: string | null };
    }) => {
      const user_id = await requireUserId();
      if (id) {
        const { error } = await supabase.from("investments").update(values).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("investments").insert({ ...values, user_id });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteInvestment() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("investments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useSaveReserve() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (values: { target_amount: number; current_amount: number }) => {
      const user_id = await requireUserId();
      const { error } = await supabase
        .from("reserves")
        .upsert({ ...values, user_id }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useSaveMonthlyLimit(month: string) {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({ category, limit }: { category: string; limit: number }) => {
      const user_id = await requireUserId();
      if (limit <= 0) {
        const { error } = await supabase
          .from("monthly_plans")
          .delete()
          .eq("month", month)
          .eq("category", category);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("monthly_plans")
        .upsert(
          { user_id, month, category, limit_amount: limit },
          { onConflict: "user_id,month,category" },
        );
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useSaveSalaryPlan(month: string) {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({
      income,
      allocations,
    }: {
      income: number;
      allocations: Record<string, number>;
    }) => {
      const user_id = await requireUserId();
      const { error } = await supabase
        .from("salary_plans")
        .upsert({ user_id, month, income, allocations }, { onConflict: "user_id,month" });
      if (error) throw error;
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ monthly_income: income })
        .eq("id", user_id);
      if (profileError) throw profileError;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateProfile() {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (values: Partial<Pick<Profile, "name" | "username" | "monthly_income" | "onboarded">>) => {
      const user_id = await requireUserId();
      const { error } = await supabase.from("profiles").update(values).eq("id", user_id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

/** Dados de demonstração — todos marcados com is_demo para poderem ser removidos. */
export function useDemoData() {
  const invalidate = useInvalidateFinance();

  const create = useMutation({
    mutationFn: async () => {
      const user_id = await requireUserId();
      const month = currentMonthKey();
      const day = (d: number) => `${month}-${String(d).padStart(2, "0")}`;
      const previous = `${currentMonthKey().slice(0, 4)}-${currentMonthKey().slice(5, 7)}`;
      void previous;

      const rows = [
        { type: "entrada", description: "Salário", amount: 2500, category: "Salário", date: day(5) },
        { type: "saida", description: "Mercado do mês", amount: 350, category: "Alimentação", date: day(6) },
        { type: "saida", description: "Transporte", amount: 200, category: "Transporte", date: day(8) },
        { type: "saida", description: "Cinema e passeios", amount: 150, category: "Lazer", date: day(12) },
        { type: "saida", description: "Contas de casa", amount: 400, category: "Contas", date: day(10) },
        {
          type: "saida",
          description: "Reserva de emergência",
          amount: 300,
          category: "Reserva de emergência",
          date: day(15),
        },
      ] as const;

      const { error } = await supabase.from("transactions").insert(
        rows.map((r) => ({ ...r, user_id, is_demo: true, note: "Dado de demonstração" })),
      );
      if (error) throw error;

      const { error: goalError } = await supabase.from("goals").insert({
        user_id,
        name: "Comprar notebook",
        target_amount: 3000,
        saved_amount: 1200,
        is_demo: true,
      });
      if (goalError) throw goalError;

      const { error: reserveError } = await supabase
        .from("reserves")
        .upsert({ user_id, target_amount: 3000, current_amount: 300 }, { onConflict: "user_id" });
      if (reserveError) throw reserveError;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async () => {
      const user_id = await requireUserId();
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("user_id", user_id)
        .eq("is_demo", true);
      if (error) throw error;
      const { error: goalError } = await supabase
        .from("goals")
        .delete()
        .eq("user_id", user_id)
        .eq("is_demo", true);
      if (goalError) throw goalError;
      const { error: investError } = await supabase
        .from("investments")
        .delete()
        .eq("user_id", user_id)
        .eq("is_demo", true);
      if (investError) throw investError;
    },
    onSuccess: invalidate,
  });

  return { create, remove };
}

export const DEFAULT_DATE = todayISO;
