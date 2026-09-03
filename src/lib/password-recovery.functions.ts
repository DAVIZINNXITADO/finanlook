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
  .validator((email: string) => email)
  .handler(async ({ data: email }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const siteUrl = process.env["SITE_URL"] ?? "";

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${siteUrl}/nova-senha`,
      },
    });

    if (error || !data?.properties?.action_link) {
      // Não existe conta com esse e-mail (ou outro erro) — não vazamos isso.
      return { ok: true, link: null as string | null };
    }

    return {
      ok: true,
      link: data.properties.action_link as string,
    };
  });
