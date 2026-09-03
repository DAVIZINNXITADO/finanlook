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
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
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


type PasswordMethod =
  | "senha"
  | "email";


export const Route =
  createFileRoute(
    "/_authenticated/configuracao/conta/email",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Trocar senha — FinanLook",
        },
        {
          name:
            "description",
          content:
            "Altere a senha da sua conta.",
        },
      ],
    }),

    component:
      TrocarSenhaPage,
  });


function TrocarSenhaPage() {
  const navigate =
    useNavigate();

  const {
    data: authUser,
  } =
    useUser();


  const [
    method,
    setMethod,
  ] =
    useState<PasswordMethod>(
      "senha",
    );

  const [
    currentPassword,
    setCurrentPassword,
  ] =
    useState("");

  const [
    newPassword,
    setNewPassword,
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
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    sendingLink,
    setSendingLink,
  ] =
    useState(false);


  function goBack() {
    navigate({
      to:
        "/_authenticated/configuracoes/conta",
    });
  }


  async function handleChangeWithPassword() {
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


    if (!currentPassword) {
      toast.error(
        "Informe sua senha atual.",
      );

      return;
    }


    if (!newPassword) {
      toast.error(
        "Informe uma nova senha.",
      );

      return;
    }


    if (
      newPassword.length <
      6
    ) {
      toast.error(
        "A senha precisa ter pelo menos 6 caracteres.",
      );

      return;
    }


    if (
      newPassword !==
      confirmPassword
    ) {
      toast.error(
        "As senhas não coincidem.",
      );

      return;
    }


    if (
      newPassword ===
      currentPassword
    ) {
      toast.error(
        "A nova senha precisa ser diferente da atual.",
      );

      return;
    }


    setSaving(
      true,
    );


    try {
      const {
        error: signInError,
      } =
        await supabase.auth.signInWithPassword({
          email:
            accountEmail,

          password:
            currentPassword,
        });


      if (signInError) {
        throw new Error(
          "Senha atual incorreta.",
        );
      }


      const {
        error,
      } =
        await supabase.auth.updateUser({
          password:
            newPassword,
        });


      if (error) {
        throw error;
      }


      setCurrentPassword(
        "",
      );

      setNewPassword(
        "",
      );

      setConfirmPassword(
        "",
      );


      toast.success(
        "Senha alterada com sucesso.",
      );


      goBack();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a senha.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }


  async function handleSendRecoveryLink() {
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


    setSendingLink(
      true,
    );


    try {
      const {
        error,
      } =
        await supabase.auth.resetPasswordForEmail(
          accountEmail,
          {
            redirectTo:
              `${window.location.origin}/nova-senha`,
          },
        );


      if (error) {
        throw error;
      }


      toast.success(
        "Enviamos um link para redefinir sua senha para o seu e-mail.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o e-mail de recuperação.",
      );
    } finally {
      setSendingLink(
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
          title="Trocar senha"
          subtitle="Escolha como você quer alterar sua senha."
        />

      </div>


      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex items-start gap-3">

          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">

            <LockKeyhole className="size-5" />

          </div>


          <div>

            <h2 className="font-display text-lg font-semibold">
              Senha
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Por segurança, confirme sua senha atual ou use um link enviado por e-mail.
            </p>

          </div>

        </div>


        <div className="space-y-2">

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">

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

              Confirmar com senha atual

            </button>


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

              <Mail className="size-4" />

              Receber link por e-mail

            </button>

          </div>

        </div>


        {method ===
        "senha" ? (
          <form
            className="mt-5 space-y-5"
            onSubmit={(
              event,
            ) => {
              event.preventDefault();

              void handleChangeWithPassword();
            }}
          >

            <div className="space-y-1.5">

              <Label htmlFor="current-password">
                Senha atual
              </Label>

              <Input
                id="current-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="h-11"
                value={
                  currentPassword
                }
                onChange={(
                  event,
                ) =>
                  setCurrentPassword(
                    event.target.value,
                  )
                }
                autoComplete="current-password"
                maxLength={1000}
              />

            </div>


            <div className="grid gap-4 md:grid-cols-2">

              <div className="space-y-1.5">

                <Label htmlFor="new-password">
                  Nova senha
                </Label>


                <div className="relative">

                  <Input
                    id="new-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    className="h-11 pr-11"
                    value={
                      newPassword
                    }
                    onChange={(
                      event,
                    ) =>
                      setNewPassword(
                        event.target.value,
                      )
                    }
                    autoComplete="new-password"
                    maxLength={1000}
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
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
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


              <div className="space-y-1.5">

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
                  autoComplete="new-password"
                  maxLength={1000}
                />

              </div>

            </div>


            <Button
              type="submit"
              className="h-11 w-full sm:w-auto"
              disabled={
                saving
              }
            >

              <LockKeyhole className="size-4" />

              {saving
                ? "Alterando..."
                : "Alterar senha"}

            </Button>

          </form>
        ) : (
          <div className="mt-5 space-y-4">

            <p className="text-sm text-muted-foreground">
              Enviaremos um link de redefinição para {
                authUser?.email ??
                "o e-mail da sua conta"
              }. Clique no link para escolher uma nova senha.
            </p>


            <Button
              type="button"
              className="h-11 w-full sm:w-auto"
              disabled={
                sendingLink
              }
              onClick={() =>
                void handleSendRecoveryLink()
              }
            >

              <Mail className="size-4" />

              {sendingLink
                ? "Enviando..."
                : "Enviar link de redefinição"}

            </Button>

          </div>
        )}

      </section>

    </div>
  );
}
