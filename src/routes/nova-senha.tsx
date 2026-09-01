import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  supabase,
} from "@/integrations/supabase/client";

export const Route =
  createFileRoute(
    "/nova-senha",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Nova senha — FinanLook",
        },
      ],
    }),

    component:
      NewPasswordPage,
  });

function NewPasswordPage() {
  const navigate =
    useNavigate();

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!password) {
      toast.error(
        "Informe uma nova senha.",
      );

      return;
    }

    if (
      password.length < 6
    ) {
      toast.error(
        "A senha precisa ter pelo menos 6 caracteres.",
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      toast.error(
        "As senhas não coincidem.",
      );

      return;
    }

    setLoading(true);

    try {
      const {
        error,
      } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      toast.success(
        "Senha alterada com sucesso.",
      );

      await navigate({
        to: "/auth",
        replace: true,
      });
    } catch (
      error,
    ) {
      console.error(error);

      toast.error(
        "Não foi possível alterar sua senha. Solicite um novo link de recuperação.",
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
            <KeyRound className="size-6 text-primary" />
          </div>
        </div>

        <div className="mt-5 text-center">
          <h1 className="font-display text-2xl font-semibold">
            Criar nova senha
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Escolha uma nova senha para acessar sua
            conta FinanLook.
          </p>
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={
            handleSubmit
          }
        >
          <div className="space-y-2">
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
                autoComplete="new-password"
                className="h-11 pr-11"
                value={password}
                onChange={(
                  event,
                ) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder="Digite sua nova senha"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (
                      current,
                    ) =>
                      !current,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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

          <div className="space-y-2">
            <Label htmlFor="confirm-password">
              Confirmar nova senha
            </Label>

            <Input
              id="confirm-password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              className="h-11"
              value={confirmPassword}
              onChange={(
                event,
              ) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              placeholder="Digite novamente"
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={loading}
          >
            <KeyRound className="size-4" />

            {loading
              ? "Alterando senha..."
              : "Salvar nova senha"}
          </Button>
        </form>

        <Button
          asChild
          variant="ghost"
          className="mt-3 w-full"
        >
          <Link to="/auth">
            Voltar para entrar
          </Link>
        </Button>
      </div>
    </div>
  );
}