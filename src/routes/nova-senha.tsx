import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useState,
  type FormEvent,
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

/* =========================================================
   ROTA
   ========================================================= */

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

        {
          name:
            "description",

          content:
            "Crie uma nova senha para acessar sua conta FinanLook.",
        },
      ],
    }),

    component:
      NewPasswordPage,
  });

/* =========================================================
   PÁGINA
   ========================================================= */

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

  /* =======================================================
     SALVAR NOVA SENHA
     ======================================================= */

  async function handleSubmit(
    event: FormEvent,
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

    setLoading(
      true,
    );

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

      setPassword(
        "",
      );

      setConfirmPassword(
        "",
      );

      setShowPassword(
        false,
      );

      await navigate({
        to:
          "/auth",

        replace:
          true,
      });
    } catch (
      error,
    ) {
      console.error(
        error,
      );

      toast.error(
        "Não foi possível alterar sua senha. Solicite um novo link de recuperação.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="surface w-full max-w-md p-6 sm:p-8">

        {/* =================================================
            ÍCONE
           ================================================= */}

        <div className="flex justify-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <KeyRound className="size-6 text-primary" />
          </div>
        </div>

        {/* =================================================
            CABEÇALHO
           ================================================= */}

        <div className="mt-5 text-center">
          <h1 className="font-display text-2xl font-semibold">
            Criar nova senha
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Escolha uma nova senha para acessar sua conta FinanLook.
          </p>
        </div>

        {/* =================================================
            FORMULÁRIO
           ================================================= */}

        <form
          className="mt-6 space-y-5"
          onSubmit={
            handleSubmit
          }
        >
          {/* NOVA SENHA */}

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
                value={
                  password
                }
                onChange={(
                  event,
                ) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder="Digite sua nova senha"
                disabled={
                  loading
                }
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
                disabled={
                  loading
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                aria-label={
                  showPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* CONFIRMAR SENHA */}

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
              value={
                confirmPassword
              }
              onChange={(
                event,
              ) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              placeholder="Digite novamente"
              disabled={
                loading
              }
            />
          </div>

          {/* SALVAR */}

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={
              loading
            }
          >
            <KeyRound className="size-4" />

            {loading
              ? "Alterando senha..."
              : "Salvar nova senha"}
          </Button>
        </form>

        {/* =================================================
            VOLTAR
           ================================================= */}

        <Button
          asChild
          variant="ghost"
          className="mt-3 w-full"
          disabled={
            loading
          }
        >
          <Link
            to="/auth"
          >
            Voltar para entrar
          </Link>
        </Button>
      </div>
    </div>
  );
}