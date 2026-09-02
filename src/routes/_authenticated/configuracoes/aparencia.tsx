import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  Check,
  ArrowLeft,
  Crown,
  Lock,
  Monitor,
  Moon,
  Palette,
  Sun,
} from "lucide-react";

import {
  toast,
} from "sonner";

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
  useTheme,
  type ThemeMode,
  type ThemeStyle,
} from "@/components/theme-provider";

import {
  THEME_COLORS,
  themeColorSwatch,
  type ThemeColorKey,
} from "@/lib/theme-colors";

import {
  cn,
} from "@/lib/utils";


export const Route =
  createFileRoute(
    "/_authenticated/configuracoes/aparencia",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Aparência — FinanLook",
        },
        {
          name:
            "description",
          content:
            "Personalize a aparência do FinanLook.",
        },
      ],
    }),

    component:
      AppearancePage,
  });


function AppearancePage() {
  const navigate =
    useNavigate();


  const {
    theme,
    setTheme,

    themeStyle,
    setThemeStyle,

    color: themeColor,
    setColor: setThemeColor,

    customColor,
    setCustomColor,
  } =
    useTheme();


  function changeTheme(
    value: ThemeMode,
  ) {
    setTheme(
      value,
    );


    const label =
      value === "light"
        ? "Tema claro ativado."
        : value === "dark"
          ? "Tema escuro ativado."
          : "Tema do sistema ativado.";


    toast.success(
      label,
    );
  }


  function changeThemeStyle(
    value: ThemeStyle,
  ) {
    setThemeStyle(
      value,
    );


    toast.success(
      value === "real"
        ? "Estilo Real ativado."
        : "Estilo Verdant ativado.",
    );
  }


  function changeThemeColor(
    value: ThemeColorKey,
  ) {
    const selected =
      THEME_COLORS.find(
        (
          color,
        ) =>
          color.key ===
          value,
      );


    if (
      selected?.premium
    ) {
      toast.info(
        "Esta cor está disponível no FinanLook Premium.",
      );

      return;
    }


    setThemeColor(
      value,
    );


    toast.success(
      `Cor ${
        selected?.label ??
        ""
      } ativada.`,
    );
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
              to: "/configuracoes",
            })
          }
          aria-label="Voltar para configurações"
        >

          <ArrowLeft className="size-5" />

        </Button>


        <PageHeader
          title="Aparência"
          subtitle="Personalize como o FinanLook aparece para você."
        />

      </div>


      {/* MODO */}

      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex items-start gap-3">

          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">

            <Monitor className="size-5" />

          </div>


          <div>

            <h2 className="font-display text-lg font-semibold">
              Modo
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Escolha entre tema claro, escuro ou siga o sistema.
            </p>

          </div>

        </div>


        <div className="grid gap-3 sm:grid-cols-3">

          <AppearanceOption
            icon={
              <Sun className="size-5" />
            }
            title="Claro"
            description="Sempre usar tema claro"
            active={
              theme ===
              "light"
            }
            onClick={() =>
              changeTheme(
                "light",
              )
            }
          />


          <AppearanceOption
            icon={
              <Moon className="size-5" />
            }
            title="Escuro"
            description="Sempre usar tema escuro"
            active={
              theme ===
              "dark"
            }
            onClick={() =>
              changeTheme(
                "dark",
              )
            }
          />


          <AppearanceOption
            icon={
              <Monitor className="size-5" />
            }
            title="Sistema"
            description="Seguir o dispositivo"
            active={
              theme ===
              "system"
            }
            onClick={() =>
              changeTheme(
                "system",
              )
            }
          />

        </div>

      </section>


      {/* ESTILO */}

      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex items-start gap-3">

          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">

            <Palette className="size-5" />

          </div>


          <div>

            <h2 className="font-display text-lg font-semibold">
              Estilo da interface
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Escolha o estilo visual geral do FinanLook.
            </p>

          </div>

        </div>


        <div className="grid gap-3 sm:grid-cols-2">

          <AppearanceOption
            title="Real"
            description="Visual padrão e equilibrado"
            active={
              themeStyle ===
              "real"
            }
            onClick={() =>
              changeThemeStyle(
                "real",
              )
            }
          />


          <AppearanceOption
            title="Verdant"
            description="Visual com identidade mais natural"
            active={
              themeStyle ===
              "verdant"
            }
            onClick={() =>
              changeThemeStyle(
                "verdant",
              )
            }
          />

        </div>

      </section>


      {/* CORES */}

      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">

        <div className="mb-6 flex items-start gap-3">

          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">

            <Palette className="size-5" />

          </div>


          <div>

            <h2 className="font-display text-lg font-semibold">
              Cor de destaque
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Altera botões, destaques e elementos principais.
            </p>

          </div>

        </div>


        <div className="grid gap-3 sm:grid-cols-2">

          {THEME_COLORS.map(
            (
              color,
            ) => {
              const active =
                themeColor ===
                color.key;


              const swatch =
                themeColorSwatch(
                  color.key,
                  customColor,
                );


              return (
                <button
                  key={
                    color.key
                  }
                  type="button"
                  onClick={() =>
                    changeThemeColor(
                      color.key,
                    )
                  }
                  className={cn(
                    "relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all",

                    active
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "hover:border-primary/30 hover:bg-muted/50",
                  )}
                >

                  <div
                    className="size-11 shrink-0 rounded-xl border shadow-sm"
                    style={{
                      backgroundColor:
                        swatch,
                    }}
                  />


                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-2">

                      <p className="font-medium">
                        {
                          color.label
                        }
                      </p>


                      {color.premium ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">

                          <Crown className="size-3" />

                          Premium

                        </span>
                      ) : null}

                    </div>


                    <p className="mt-1 text-sm text-muted-foreground">
                      {
                        color.description
                      }
                    </p>

                  </div>


                  {active ? (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">

                      <Check className="size-3.5" />

                    </span>
                  ) : color.premium ? (

                    <Lock className="size-4 shrink-0 text-muted-foreground" />

                  ) : null}

                </button>
              );
            },
          )}

        </div>


        {themeColor ===
        "custom" ? (

          <div className="mt-5 rounded-xl border bg-muted/30 p-4">

            <Label htmlFor="custom-color">
              Cor personalizada
            </Label>


            <div className="mt-3 flex gap-3">

              <input
                id="custom-color"
                type="color"
                value={
                  customColor
                }
                onChange={(
                  event,
                ) =>
                  setCustomColor(
                    event.target.value,
                  )
                }
                className="h-11 w-14 cursor-pointer rounded-lg border bg-transparent p-1"
              />


              <Input
                value={
                  customColor
                }
                onChange={(
                  event,
                ) =>
                  setCustomColor(
                    event.target.value,
                  )
                }
                placeholder="#2f6df6"
                className="h-11 flex-1 uppercase"
                maxLength={20}
              />

            </div>

          </div>

        ) : null}

      </section>


      <div className="flex justify-end">

        <Button
          type="button"
          onClick={() =>
            navigate({
              to: "/configuracoes",
            })
          }
        >

          <Check className="size-4" />

          Concluir

        </Button>

      </div>

    </div>
  );
}


type AppearanceOptionProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
};


function AppearanceOption(
  {
    icon,
    title,
    description,
    active,
    onClick,
  }: AppearanceOptionProps,
) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={cn(
        "relative flex min-h-28 items-start gap-3 rounded-xl border p-4 text-left transition-all",

        active
          ? "border-primary bg-primary/10 shadow-sm"
          : "hover:border-primary/30 hover:bg-muted/50",
      )}
    >

      {icon ? (
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">

          {icon}

        </div>
      ) : null}


      <div className="min-w-0 flex-1">

        <p className="font-medium">
          {title}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>

      </div>


      {active ? (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">

          <Check className="size-3.5" />

        </span>
      ) : null}

    </button>
  );
}