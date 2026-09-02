import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useState,
} from "react";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  toast,
} from "sonner";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  User,
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
  useProfile,
  useUser,
} from "@/lib/data";


export const Route =
  createFileRoute(
    "/_authenticated/configuracoes/conta",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Conta — FinanLook",
        },
        {
          name:
            "description",
          content:
            "Gerencie seu perfil, e-mail e senha.",
        },
      ],
    }),

    component:
      ContaPage,
  });


function ContaPage() {
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const {
    data: profile,
  } =
    useProfile();

  const {
    data: authUser,
  } =
    useUser();


  const [
    name,
    setName,
  ] =
    useState(
      profile?.name ??
      "",
    );

  const [
    username,
    setUsername,
  ] =
    useState(
      profile?.username ??
      "",
    );

  const [
    currentEmail,
    setCurrentEmail,
  ] =
    useState(
      authUser?.email ??
      "",
    );

  const [
    newEmail,
    setNewEmail,
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
    savingProfile,
    setSavingProfile,
  ] =
    useState(false);

  const [
    savingEmail,
    setSavingEmail,
  ] =
    useState(false);

  const [
    savingPassword,
    setSavingPassword,
  ] =
    useState(false);


  async function saveProfile() {
    const cleanName =
      name.trim();

    const cleanUsername =
      username
        .trim()
        .replace(
          /^@/,
          "",
        )
        .toLowerCase();


    if (!cleanName) {
      toast.error(
        "Informe seu nome.",
      );

      return;
    }


    if (!cleanUsername) {
      toast.error(
        "Informe seu nome de usuário.",
      );

      return;
    }


    if (
      cleanUsername.length <
      3
    ) {
      toast.error(
        "O nome de usuário precisa ter pelo menos 3 caracteres.",
      );

      return;
    }


    if (
      !/^[a-zA-Z0-9._-]+$/.test(
        cleanUsername,
      )
    ) {
      toast.error(
        "Use apenas letras, números, ponto, hífen ou underline.",
      );

      return;
    }


    setSavingProfile(
      true,
    );


    try {
      const {
        data,
        error: userError,
      } =
        await supabase.auth.getUser();


      if (
        userError ||
        !data.user
      ) {
        throw new Error(
          "Usuário não autenticado.",
        );
      }


      const {
        error,
      } =
        await supabase
          .from(
            "profiles",
          )
          .update({
            name:
              cleanName.slice(
                0,
                80,
              ),

            username:
              cleanUsername.slice(
                0,
                40,
              ),
          })
          .eq(
            "id",
            data.user.id,
          );


      if (error) {
        throw error;
      }


      await queryClient.invalidateQueries({
        queryKey: [
          "profile",
        ],
      });


      toast.success(
        "Perfil atualizado com sucesso.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar seu perfil.",
      );
    } finally {
      setSavingProfile(
        false,
      );
    }
  }


  async function saveEmail() {
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


    setSavingEmail(
      true,
    );


    try {
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


      toast.success(
        "Verifique seu e-mail para confirmar a alteração.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o e-mail.",
      );
    } finally {
      setSavingEmail(
        false,
      );
    }
  }


  async function savePassword() {
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


    setSavingPassword(
      true,
    );


    try {
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


      setNewPassword(
        "",
      );

      setConfirmPassword(
        "",
      );


      toast.success(
        "Senha alterada com sucesso.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a senha.",
      );
    } finally {
      setSavingPassword(
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
          onClick={() =>
            navigate({
              to:
                "/_authenticated/configuracoes",
            })
          }
          aria-label="Voltar para configurações"
        >

          <ArrowLeft className="size-5" />

        </Button>


        <PageHeader
          title="Conta"
          subtitle="Gerencie seu perfil, e-mail e senha."
        />

      </div>


      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex items-start gap-3">

          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">

            <User className="size-5" />

          </div>


          <div>

            <h2 className="font-display text-lg font-semibold">
              Perfil
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Atualize as informações exibidas na sua conta.
            </p>

          </div>

        </div>


        <div className="grid gap-4 md:grid-cols-2">

          <div className="space-y-1.5">

            <Label htmlFor="account-name">
              Nome
            </Label>

            <Input
              id="account-name"
              className="h-11"
              value={
                name
              }
              onChange={(
                event,
              ) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="Seu nome"
              maxLength={80}
              autoComplete="name"
            />

          </div>


          <div className="space-y-1.5">

            <Label htmlFor="account-username">
              Nome de usuário
            </Label>

            <Input
              id="account-username"
              className="h-11"
              value={
                username
              }
              onChange={(
                event,
              ) =>
                setUsername(
                  event.target.value,
                )
              }
              placeholder="seuusername"
              maxLength={40}
              autoComplete="username"
            />

          </div>

        </div>


        <div className="mt-5">

          <Button
            type="button"
            disabled={
              savingProfile
            }
            onClick={() =>
              void saveProfile()
            }
          >

            <Save className="size-4" />

            {savingProfile
              ? "Salvando..."
              : "Salvar perfil"}

          </Button>

        </div>

      </section>


      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex items-start gap-3">

          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">

            <Mail className="size-5" />

          </div>


          <div>

            <h2 className="font-display text-lg font-semibold">
              E-mail
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Confirme seu e-mail atual e informe o novo endereço.
            </p>

          </div>

        </div>


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


        <div className="mt-5">

          <Button
            type="button"
            disabled={
              savingEmail
            }
            onClick={() =>
              void saveEmail()
            }
          >

            <Mail className="size-4" />

            {savingEmail
              ? "Enviando..."
              : "Alterar e-mail"}

          </Button>

        </div>

      </section>


      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex items-start gap-3">

          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">

            <ShieldCheck className="size-5" />

          </div>


          <div>

            <h2 className="font-display text-lg font-semibold">
              Senha
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Escolha uma nova senha para proteger sua conta.
            </p>

          </div>

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


        <div className="mt-5">

          <Button
            type="button"
            disabled={
              savingPassword
            }
            onClick={() =>
              void savePassword()
            }
          >

            <LockKeyhole className="size-4" />

            {savingPassword
              ? "Alterando..."
              : "Alterar senha"}

          </Button>

        </div>

      </section>

    </div>
  );
}
