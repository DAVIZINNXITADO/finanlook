import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type OpenFinanceConnection =
  Database["public"]["Tables"]["open_finance_connections"]["Row"];

/**
 * Camada de integração Open Finance.
 *
 * Nenhum provedor está configurado no momento. O FinanLook nunca
 * pede nem armazena senha do banco, cartão ou código de segurança.
 * Quando um provedor compatível for conectado, basta preencher
 * `OPEN_FINANCE_PROVIDER` e implementar `startConnection`.
 *
 * Fluxo previsto:
 * instituição → provedor Open Finance → FinanLook → movimentações
 */
export const OPEN_FINANCE_PROVIDER: string | null = null;

export const OPEN_FINANCE_PROVIDER_CONFIGURED =
  OPEN_FINANCE_PROVIDER !== null;

export class OpenFinanceNotConfiguredError extends Error {
  constructor() {
    super(
      "Nenhum provedor Open Finance está configurado. A conexão com instituições ficará disponível quando a integração for habilitada.",
    );
    this.name = "OpenFinanceNotConfiguredError";
  }
}

export function useOpenFinanceConnections() {
  return useQuery({
    queryKey: ["open-finance-connections"],
    queryFn: async (): Promise<OpenFinanceConnection[]> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [];

      const { data, error } = await supabase
        .from("open_finance_connections")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}

/**
 * Inicia a conexão com uma instituição.
 * Sem provedor configurado, falha de forma explícita —
 * nunca cria uma conexão falsa.
 */
export function useStartOpenFinanceConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!OPEN_FINANCE_PROVIDER_CONFIGURED) {
        throw new OpenFinanceNotConfiguredError();
      }

      throw new OpenFinanceNotConfiguredError();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["open-finance-connections"],
      });
    },
  });
}

export function useDisconnectInstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada. Entre novamente.");

      const { error } = await supabase
        .from("open_finance_connections")
        .delete()
        .eq("id", id)
        .eq("user_id", auth.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["open-finance-connections"],
      });
    },
  });
}
