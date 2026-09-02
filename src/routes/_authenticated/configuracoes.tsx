import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  Palette,
  ShieldCheck,
  ChevronRight,
  User,
} from "lucide-react";

import {
  PageHeader,
} from "@/components/PageHeader";

import {
  cn,
} from "@/lib/utils";


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


  return (
    <div className="space-y-6">

      <PageHeader
        title="Configurações"
        subtitle="Gerencie sua conta e personalize sua experiência no FinanLook."
      />


      <section className="space-y-4">

        <div>

          <h2 className="font-display text-lg font-semibold">
            Configurações
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Escolha uma categoria para continuar.
          </p>

        </div>


        <div className="grid gap-4 md:grid-cols-2">

          <SettingsCard
            icon={
              <ShieldCheck className="size-6" />
            }
            iconClassName="
              bg-primary/10
              text-primary
            "
            title="Conta"
            description="
              Gerencie seu perfil, nome de usuário,
              e-mail e senha.
            "
            onClick={() =>
              navigate({
                to:
                  "/configuracoes/conta",
              })
            }
          />


          <SettingsCard
            icon={
              <Palette className="size-6" />
            }
            iconClassName="
              bg-primary/10
              text-primary
            "
            title="Aparência"
            description="
              Personalize o tema, estilo visual
              e as cores do FinanLook.
            "
            onClick={() =>
              navigate({
                to:
                  "/configuracoes/aparencia",
              })
            }
          />

        </div>

      </section>


      <section className="rounded-2xl border bg-card p-5">

        <div className="flex items-start gap-4">

          <div
            className="
              flex
              size-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-muted
            "
          >

            <User className="size-5 text-muted-foreground" />

          </div>


          <div>

            <h3 className="font-medium">
              Suas configurações
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              As informações da sua conta e suas preferências
              ficam separadas em áreas específicas para facilitar
              o gerenciamento e evitar alterações acidentais.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}


type SettingsCardProps = {
  icon: React.ReactNode;

  iconClassName?: string;

  title: string;

  description: string;

  onClick: () => void;
};


function SettingsCard({
  icon,
  iconClassName,
  title,
  description,
  onClick,
}: SettingsCardProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="
        group
        flex
        w-full
        items-center
        gap-4
        rounded-2xl
        border
        bg-card
        p-5
        text-left
        transition-all
        hover:border-primary/40
        hover:bg-muted/30
        hover:shadow-sm
      "
    >

      <div
        className={
          cn(
            `
              flex
              size-12
              shrink-0
              items-center
              justify-center
              rounded-xl
            `,
            iconClassName,
          )
        }
      >

        {icon}

      </div>


      <div className="min-w-0 flex-1">

        <h3 className="font-semibold">

          {title}

        </h3>


        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">

          {description}

        </p>

      </div>


      <ChevronRight
        className="
          size-5
          shrink-0
          text-muted-foreground
          transition-transform
          group-hover:translate-x-1
        "
      />

    </button>
  );
}