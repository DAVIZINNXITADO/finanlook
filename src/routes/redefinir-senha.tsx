import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/redefinir-senha")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (password.length < 6) {
      toast.error(
        "A senha precisa ter pelo menos 6 caracteres.",
      );
      return;
    }

    if (password !== confirm) {
      toast.error(
        "As senhas não coincidem.",
      );
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      toast.success(
        "Senha redefinida com sucesso!",
      );

      navigate({
        to: "/visao-geral",
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível redefinir sua senha.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="surface w-full max-w-sm overflow-hidden">
        <div className="border-b bg-primary/[0.03] px-6 py-7 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <KeyRound className="size-6 text-primary" />
          </div>

          <h1 className="mt-4 font-display text-2xl font-semibold">
            Criar nova senha
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Escolha uma nova senha para sua conta.
          </p>
        </div>

        <form
          className="space-y-4 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="password">
              Nova senha
            </Label>

            <div className="relative">
              <Input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                className="h-11 pr-11"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Mostrar ou ocultar senha"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">
              Confirmar nova senha
            </Label>

            <Input
              id="confirm"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={confirm}
              onChange={(event) =>
                setConfirm(
                  event.target.value,
                )
              }
              autoComplete="new-password"
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={loading}
          >
            {loading
              ? "Salvando..."
              : "Redefinir senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}