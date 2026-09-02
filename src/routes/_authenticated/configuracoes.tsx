import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  toast,
} from "sonner";

import {
  ChevronRight,
  LogOut,
  Palette,
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
  supabase,
} from "@/integrations/supabase/client";


export const Route =
  createFileRoute(
    "/_authenticated/configuracoes",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Configurações — FinanLook",
        },
        {
          name:
            "description",
          content:
            "Gerencie sua conta e personalize sua experiência no FinanLook.",
        },
      ],
    }),

    component:
      SettingsPage,
  });


function SettingsPage() {
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();


  async function signOut() {
    try {
      await queryClient.cancelQueries();

      queryClient.clear();


      const {
        error,
      } =
        await supabase.auth.signOut();


      if (error) {
        throw error;
      }


      await navigate({
        to:
          "/auth",

        search: {
          modo:
            "entrar",
        },

        replace:
          true,
      });
    } catch {
      toast.error(
        "Não foi possível sair da conta.",
      );
    }
  }


  return (
    <div className="space-y-6">

      <PageHeader
        title="Configurações"
        subtitle="Gerencie sua conta e personalize sua experiência no FinanLook."
      />


      <section className="space-y-3">

        <div>

          <h2 className="font-display text-lg font-semibold">
            Configurações
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Escolha uma categoria para gerenciar suas preferências.
          </p>

        </div>


        <div className="overflow-hidden rounded-2xl border bg-card">

          <SettingsMenuItem
            icon={
              <User className="size-5" />
            }
            title="Perfil"
            description="Atualize seu nome e nome de usuário."
            onClick={() =>
              navigate({
                to:
                  "/configuracoes/perfil",
              })
            }
          />


          <SettingsMenuItem
            icon={
              <ShieldCheck className="size-5" />
            }
            title="Conta e segurança"
            description="Gerencie seu e-mail, senha e segurança da conta."
            onClick={() =>
              navigate({
                to:
                  "/configuracoes/conta",
              })
            }
          />


          <SettingsMenuItem
            icon={
              <Palette className="size-5" />
            }
            title="Aparência"
            description="Personalize o tema, estilo e cores do FinanLook."
            onClick={() =>
              navigate({
                to:
                  "/configuracoes/aparencia",
              })
            }
          />

        </div>

      </section>


      <section className="space-y-3">

        <div>

          <h2 className="font-display text-lg font-semibold">
            Sessão
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie o acesso à sua conta neste dispositivo.
          </p>

        </div>


        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">

                <LogOut className="size-5" />

              </div>


              <div>

                <h3 className="font-medium">
                  Sair da conta
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Encerrar sua sessão neste dispositivo.
                </p>

              </div>

            </div>


            <Button
              type="button"
              variant="outline"
              className="h-10 shrink-0"
              onClick={() =>
                void signOut()
              }
            >

              <LogOut className="size-4" />

              Sair

            </Button>

          </div>

        </div>

      </section>

    </div>
  );
}


type SettingsMenuItemProps = {
  icon:
    React.ReactNode;

  title:
    string;

  description:
    string;

  onClick:
    () => void;
};


function SettingsMenuItem({
  icon,
  title,
  description,
  onClick,
}: SettingsMenuItemProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="flex w-full items-center gap-4 border-b p-4 text-left transition-colors last:border-b-0 hover:bg-muted/50"
    >

      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">

        {icon}

      </span>


      <span className="min-w-0 flex-1">

        <span className="block font-medium">
          {title}
        </span>

        <span className="mt-1 block text-sm text-muted-foreground">
          {description}
        </span>

      </span>


      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />

    </button>
  );
}