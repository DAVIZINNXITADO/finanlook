import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute(
  "/recuperar-senha",
)({
  head: () => ({
    meta: [
      {
        title:
          "Recuperar senha — FinanLook",
      },
      {
        name:
          "description",

        content:
          "Recupere o acesso à sua conta FinanLook.",
      },
    ],
  }),

  component:
    RecoverPasswordPage,
});

function RecoverPasswordPage() {
  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    sent,
    setSent,
  ] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (!normalizedEmail) {
      toast.error(
        "Informe seu email.",
      );

      return;
    }

    if (
      !normalizedEmail.includes(
        "@",
      )
    ) {
      toast.error(
        "Informe um email válido.",
      );

      return;
    }

    setLoading(true);

    try {
      const {
        error,
      } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo:
              `${window.location.origin}/nova-senha`,
          },
        );

      if (error) {
        throw error;
      }

      setSent(true);

      toast.success(
        "Se houver uma conta com esse email, você receberá as instruções para recuperar sua senha.",
      );
    } catch (
      error,
    ) {
      console.error(error);

      toast.error(
        "Não foi possível solicitar a recuperação da senha. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="surface w-full max-w-md p-6 sm:p-8">
        <div className="flex justify-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="size-6 text-primary" />
          </div>
        </div>

        <div className="mt-5 text-center">
          <h1 className="font-display text-2xl font-semibold">
            Recuperar senha
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Informe o email da sua conta e enviaremos
            um link para você criar uma nova senha.
          </p>
        </div>

        {sent ? (
          <div className="mt-6">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <Mail className="mx-auto size-6 text-primary" />

              <h2 className="mt-3 font-medium">
                Verifique seu email
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Se existir uma conta associada a este
                endereço, você receberá as instruções
                para recuperar sua senha.
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              className="mt-5 h-11 w-full"
            >
              <Link to="/auth">
                Voltar para entrar
              </Link>
            </Button>
          </div>
        ) : (
          <form
            className="mt-6 space-y-5"
            onSubmit={
              handleSubmit
            }
          >
            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="h-11"
                value={email}
                onChange={(
                  event,
                ) =>
                  setEmail(
                    event.target.value,
                  )
                }
                placeholder="voce@email.com"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={loading}
            >
              <Send className="size-4" />

              {loading
                ? "Enviando..."
                : "Enviar link de recuperação"}
            </Button>
          </form>
        )}

        <Link
          to="/auth"
          className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />

          Voltar para entrar
        </Link>
      </div>
    </div>
  );
}