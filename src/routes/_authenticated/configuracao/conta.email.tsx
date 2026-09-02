import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useState,
} from "react";

import {
  toast,
} from "sonner";

import {
  ArrowLeft,
  KeyRound,
  Mail,
  MailCheck,
} from "lucide-react";

import {
  PageHeader,
} from "@/components/PageHeader";

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

import {
  useUser,
} from "@/lib/data";


type VerificationMethod =
  | "email"
  | "senha";


export const Route =
  createFileRoute(
    "/_authenticated/configuracoes/conta/email",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Trocar e-mail — FinanLook",
        },
        {
          name:
            "description",
          content:
            "Altere o e-mail da sua conta.",
        },
      ],
    }),

    component:
      TrocarEmailPage,
  });


function TrocarEmailPage() {
  const navigate =
    useNavigate();

  const {
    data: authUser,
  } =
    useUser();


  const [
    currentEmail,
    setCurrentEmail,
  ] =
    useState("");

  const [
    newEmail,
    setNewEmail,
  ] =
    useState("");

  const [
    method,
    setMethod,
  ] =
    useState<VerificationMethod>(
      "email",
    );

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    saving,
    setSaving,
  ] =
    useState(false);


  function goBack() {
    navigate({
      to:
        "/_authenticated/configuracoes/conta",
    });
  }


  async function handleSubmit() {
    const current =
      currentEmail
        .trim()
        .toLowerCase();

    const next =
      newEmail
        .trim()
        .toLowerCase();

    const accountEmail =
      authUser?.email
        ?.trim()
        .toLowerCase() ??
      "";


    if (!accountEmail) {
      toast.error(
        "Não foi possível identificar o e-mail da sua conta.",
      );

      return;
    }


    if (
      current !==
      accountEmail
    ) {
      toast.error(
        "Digite corretamente o seu e-mail atual.",
      );

      return;
    }


    if (!next) {
      toast.error(
        "Informe o novo e-mail.",
      );

      return;
    }


    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        next,
      )
    ) {
      toast.error(
        "Informe um e-mail válido.",
      );

      return;
    }


    if (
      next ===
      accountEmail
    ) {
      toast.error(
        "O novo e-mail precisa ser diferente do atual.",
      );

      return;
    }


    if (
      method ===
        "senha" &&
      !password
    ) {
      toast.error(
        "Digite sua senha atual para confirmar.",
      );

      return;
    }


    setSaving(
      true,
    );


    try {
      if (
        method ===
        "senha"
      ) {
        const {
          error: signInError,
        } =
          await supabase.auth.signInWithPassword({
            email:
              accountEmail,

            password,
          });


        if (signInError) {
          throw new Error(
            "Senha incorreta.",
          );
        }
      }


      const {
        error,
      } =
        await supabase.auth.updateUser({
          email:
            next,
        });


      if (error) {
        throw error;
      }


      setNewEmail(
        "",
      );

      setPassword(
        "",
      );


      toast.success(
        method ===
        "senha"
          ? "E-mail atualizado com sucesso."
          : "Verifique seu e-mail para confirmar a alteração.",
      );


      goBack();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o e-mail.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }


  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3">

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={
            goBack
          }
          aria-label="Voltar para conta"
        >

          <ArrowLeft className="size-5" />

        </Button>


        <PageHeader
          title="Trocar e-mail"
          subtitle="Confirme seu e-mail atual e escolha como verificar a troca."
        />

      </div>


      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex items-start gap-3">

          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">

            <Mail className="size-5" />

          </div>


          <div>

            <h2 className="font-display text-lg font-semibold">
              Novo e-mail
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Sua conta atual é {
                authUser?.email ??
                "—"
              }
            </p>

          </div>

        </div>


        <form
          className="space-y-5"
          onSubmit={(
            event,
          ) => {
            event.preventDefault();

            void handleSubmit();
          }}
        >

          <div className="grid gap-4 md:grid-cols-2">

            <div className="space-y-1.5">

              <Label htmlFor="current-email">
                E-mail atual
              </Label>

              <Input
                id="current-email"
                type="email"
                className="h-11"
                value={
                  currentEmail
                }
                onChange={(
                  event,
                ) =>
                  setCurrentEmail(
                    event.target.value,
                  )
                }
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
                maxLength={255}
              />

            </div>


            <div className="space-y-1.5">

              <Label htmlFor="new-email">
                Novo e-mail
              </Label>

              <Input
                id="new-email"
                type="email"
                className="h-11"
                value={
                  newEmail
                }
                onChange={(
                  event,
                ) =>
                  setNewEmail(
                    event.target.value,
                  )
                }
                placeholder="novo@email.com"
                autoComplete="email"
                maxLength={255}
              />

            </div>

          </div>


          <div className="space-y-2">

            <Label>
              Método de verificação
            </Label>


            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">

              <button
                type="button"
                onClick={() =>
                  setMethod(
                    "email",
                  )
                }
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  method ===
                  "email"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >

                <MailCheck className="size-4" />

                Verificar por e-mail

              </button>


              <button
                type="button"
                onClick={() =>
                  setMethod(
                    "senha",
                  )
                }
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  method ===
                  "senha"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >

                <KeyRound className="size-4" />

                Confirmar com senha

              </button>

            </div>


            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {method ===
              "email"
                ? "Enviaremos um link de confirmação para o seu e-mail para validar a troca antes de aplicá-la."
                : "Confirme sua senha atual e a troca é aplicada imediatamente, sem precisar checar o e-mail."}
            </p>

          </div>


          {method ===
            "senha" && (
            <div className="space-y-1.5">

              <Label htmlFor="confirm-password">
                Sua senha atual
              </Label>

              <Input
                id="confirm-password"
                type="password"
                className="h-11"
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
                autoComplete="current-password"
                maxLength={1000}
              />

            </div>
          )}


          <Button
            type="submit"
            className="h-11 w-full sm:w-auto"
            disabled={
              saving
            }
          >

            <Mail className="size-4" />

            {saving
              ? "Enviando..."
              : "Alterar e-mail"}

          </Button>

        </form>

      </section>

    </div>
  );
}
