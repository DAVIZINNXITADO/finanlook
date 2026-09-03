import { createServerFn } from "@tanstack/react-start";

/**
 * Gera um link de recuperação de senha via Supabase Admin, SEM disparar
 * o e-mail automático do Supabase. O link deve ser enviado pelo próprio
 * cliente usando o EmailJS.
 *
 * Por segurança, sempre retorna { ok: true }, mesmo que o e-mail não
 * exista na base — isso evita que alguém descubra quais e-mails têm
 * conta só testando esse formulário. O campo `link` só vem preenchido
 * quando o e-mail existe de fato.
 */
export const generateRecoveryLink = createServerFn({ method: "POST" })
  .validator((data: { email: string; origin: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: linkData, error } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: data.email,
        options: {
          redirectTo: `${data.origin}/nova-senha`,
        },
      });

    if (error || !linkData?.properties?.action_link) {
      // Não existe conta com esse e-mail (ou outro erro) — não vazamos isso.
      return { ok: true, link: null as string | null };
    }

    return {
      ok: true,
      link: linkData.properties.action_link as string,
    };
  });
