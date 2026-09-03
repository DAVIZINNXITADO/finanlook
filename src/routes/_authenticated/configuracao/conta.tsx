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
  ChevronRight,
  KeyRound,
  Mail,
  Save,
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
    "/_authenticated/configuracao/conta",
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
    savingProfile,
    setSavingProfile,
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
                "/configuracoes",
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


      <section className="rounded-2xl border bg-card shadow-sm">

        <div className="p-5 pb-3 sm:p-6 sm:pb-3">

          <h2 className="font-display text-lg font-semibold">
            Segurança e acesso
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Altere seu e-mail ou sua senha de acesso.
          </p>

        </div>


        <div className="divide-y">

          <NavRow
            icon={<Mail className="size-5" />}
            title="Trocar e-mail"
            description={
              authUser?.email ??
              "Gerencie o e-mail da sua conta"
            }
            onClick={() =>
              navigate({
                to:
                  "/configuracao/conta/email",
              })
            }
          />


          <NavRow
            icon={<KeyRound className="size-5" />}
            title="Trocar senha"
            description="Altere a senha usada para entrar na sua conta"
            onClick={() =>
              navigate({
                to:
                  "/configuracao/conta/senha",
              })
            }
          />

        </div>

      </section>

    </div>
  );
}


function NavRow({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50 sm:px-6"
    >

      <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
        {icon}
      </div>


      <div className="min-w-0 flex-1">

        <p className="font-medium">
          {title}
        </p>

        <p className="truncate text-sm text-muted-foreground">
          {description}
        </p>

      </div>


      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />

    </button>
  );
}
