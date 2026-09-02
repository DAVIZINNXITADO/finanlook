import {
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import {
  ArrowLeftRight,
  CalendarRange,
  ChartPie,
  Crown,
  Goal,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  useState,
  type ReactNode,
} from "react";

import {
  supabase,
} from "@/integrations/supabase/client";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  cn,
} from "@/lib/utils";

import {
  AdSlot,
} from "@/components/AdSlot";

import {
  SiteIcon,
} from "@/components/SiteIcon";

import {
  useProfile,
} from "@/lib/data";

import {
  PAYMENTS_PROVIDER_CONFIGURED,
  usePlan,
} from "@/lib/premium";

/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

const NAV = [
  {
    to: "/visao-geral",
    label: "Visão geral",
    icon: LayoutDashboard,
  },

  {
    to: "/movimentacoes",
    label: "Movimentações",
    icon: ArrowLeftRight,
  },

  {
    to: "/organizar-salario",
    label: "Organizar salário",
    icon: Landmark,
  },

  {
    to: "/contas",
    label: "Contas",
    icon: WalletCards,
  },

  {
    to: "/reserva",
    label: "Reserva",
    icon: LifeBuoy,
  },

  {
    to: "/metas",
    label: "Metas",
    icon: Goal,
  },

  {
    to: "/investimentos",
    label: "Investimentos",
    icon: TrendingUp,
  },

  {
    to: "/planejamento",
    label: "Planejamento do mês",
    icon: CalendarRange,
  },

  {
    to: "/relatorios",
    label: "Relatórios",
    icon: ChartPie,
  },

  {
    to: "/configuracoes",
    label: "Configurações",
    icon: Settings,
  },
] as const;

/*
 * Os 4 principais ficam sempre
 * visíveis na barra inferior.
 *
 * O restante aparece em "Mais".
 */
const MOBILE_MAIN =
  NAV.slice(
    0,
    4,
  );

const AD_ENABLED_PATHS = new Set([
  "/visao-geral",
  "/movimentacoes",
  "/contas",
  "/organizar-salario",
  "/reserva",
  "/metas",
  "/investimentos",
]);

/* =========================================================
   APPSHELL
   ========================================================= */

export function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const {
    data: profile,
  } =
    useProfile();

  const {
    data: plan,
    isLoading: isLoadingPlan,
  } =
    usePlan();

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  const [
    premiumOpen,
    setPremiumOpen,
  ] =
    useState(false);

  const pathname =
    useRouterState({
      select: (state) =>
        state.location.pathname,
    });

  const isPremium =
    plan?.isPremium ??
    false;

  /* =======================================================
     LOGOUT
     ======================================================= */

  async function signOut() {
    await queryClient.cancelQueries();

    queryClient.clear();

    const {
      error,
    } =
      await supabase.auth.signOut();

    if (error) {
      return;
    }

    navigate({
      to: "/auth",
      replace: true,
    });
  }

  /* =======================================================
     PREMIUM

     Por enquanto não tenta processar pagamento.

     O provider está desligado em:

     PAYMENTS_PROVIDER_CONFIGURED = false
     ======================================================= */

  function handlePremium() {
    setPremiumOpen(true);
  }

  /* =======================================================
     VERIFICA SE ROTA ESTÁ NO MENU MAIS
     ======================================================= */

  const isMoreActive =
    !MOBILE_MAIN.some(
      (item) =>
        pathname === item.to,
    );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="min-h-screen bg-background md:flex">

      {/* =================================================
          MENU DESKTOP
         ================================================= */}

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex">

        {/* LOGO */}

        <Link
          to="/visao-geral"
          className="mb-6 flex items-center gap-2 px-2"
        >
          <SiteIcon
            className="size-9 rounded-xl object-contain"
          />

          <span className="font-display text-lg font-semibold">
            FinanLook
          </span>
        </Link>

        {/* NAVEGAÇÃO */}

        <nav className="flex flex-1 flex-col gap-1">

          {
            NAV.map(
              (item) => (
                <NavItem
                  key={
                    item.to
                  }
                  {...item}
                  active={
                    pathname ===
                    item.to
                  }
                />
              ),
            )
          }

        </nav>

        {/* PREMIUM DESKTOP */}

        {
          !isLoadingPlan
            ? (
              <PremiumCard
                isPremium={
                  isPremium
                }
                onClick={
                  handlePremium
                }
              />
            )
            : null
        }

        {/* USUÁRIO */}

        <div className="mt-3 rounded-2xl bg-sidebar-accent/60 p-3">

          <p className="truncate text-sm font-medium">
            {
              profile?.name ||
              "Você"
            }
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {
              profile?.username
                ? `@${profile.username}`
                : ""
            }
          </p>

          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start"
            onClick={() =>
              void signOut()
            }
          >
            <LogOut className="size-4" />

            Sair da conta
          </Button>

        </div>

      </aside>

      {/* =================================================
          ÁREA PRINCIPAL
         ================================================= */}

      <div className="min-w-0 flex-1">

        {/* ===============================================
            HEADER MOBILE

            SEM BOTÃO DE MENU.

            O ÚNICO BOTÃO PARA ABRIR
            O MENU É "MAIS", EMBAIXO.
           =============================================== */}

        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:justify-end">

          <Link
            to="/visao-geral"
            className="flex min-w-0 items-center gap-2 md:hidden"
          >
            <SiteIcon
              className="size-8 shrink-0 rounded-lg object-contain"
            />

            <span className="truncate font-display text-base font-semibold">
              FinanLook
            </span>
          </Link>

          {!isLoadingPlan ? (
            isPremium ? (
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <Crown className="size-4" />
                Premium ativo
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePremium}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <Crown className="size-4" />
                Seja Premium
              </Button>
            )
          ) : null}

        </header>

        {/* ===============================================
            MENU MOBILE

            ABERTO APENAS PELO BOTÃO
            "MAIS" DA BARRA INFERIOR.
           =============================================== */}

        <Sheet
          open={
            menuOpen
          }
          onOpenChange={
            setMenuOpen
          }
        >

          <SheetContent
            side="right"
            className="flex w-[85vw] max-w-xs flex-col p-4"
          >

            <SheetTitle className="font-display">
              Menu
            </SheetTitle>

            {/* ===========================================
                USUÁRIO
               =========================================== */}

            <div className="mt-4 rounded-xl bg-secondary p-3">

              <p className="truncate text-sm font-medium">
                {
                  profile?.name ||
                  "Você"
                }
              </p>

              <p className="truncate text-xs text-muted-foreground">
                {
                  profile?.username
                    ? `@${profile.username}`
                    : ""
                }
              </p>

            </div>

            {/* ===========================================
                PREMIUM MOBILE
               =========================================== */}

            {
              !isLoadingPlan
                ? (
                  <div className="mt-3">

                    <PremiumCard
                      isPremium={
                        isPremium
                      }
                      onClick={
                        handlePremium
                      }
                    />

                  </div>
                )
                : null
            }

            {/* ===========================================
                NAVEGAÇÃO
               =========================================== */}

            <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto">

              {
                NAV.map(
                  (item) => (
                    <NavItem
                      key={
                        item.to
                      }
                      {...item}
                      active={
                        pathname ===
                        item.to
                      }
                      onNavigate={() =>
                        setMenuOpen(
                          false,
                        )
                      }
                    />
                  ),
                )
              }

            </nav>

            {/* ===========================================
                LOGOUT
               =========================================== */}

            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() =>
                void signOut()
              }
            >
              <LogOut className="size-4" />

              Sair da conta
            </Button>

          </SheetContent>

        </Sheet>

        <Dialog
          open={premiumOpen}
          onOpenChange={setPremiumOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:mx-0">
                <Crown className="size-6" />
              </div>

              <DialogTitle className="pt-2">
                FinanLook Premium
              </DialogTitle>

              <DialogDescription>
                Tenha mais clareza para planejar, analisar e organizar sua vida financeira.
              </DialogDescription>
            </DialogHeader>

            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "Relatórios e análises financeiras avançadas",
                "Planejamento com projeções e limites por categoria",
                "Mais recursos para automatizar sua organização",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-sm text-muted-foreground">
              {PAYMENTS_PROVIDER_CONFIGURED
                ? "A assinatura será aberta na próxima etapa."
                : "A assinatura Premium estará disponível em breve. O botão ficará ativo assim que os pagamentos forem conectados."}
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={!PAYMENTS_PROVIDER_CONFIGURED}
            >
              <Crown className="size-4" />
              {PAYMENTS_PROVIDER_CONFIGURED
                ? "Assinar Premium"
                : "Disponível em breve"}
            </Button>
          </DialogContent>
        </Dialog>

        {/* ===============================================
            CONTEÚDO
           =============================================== */}

        <main className="w-full px-4 pb-28 pt-5 sm:px-6 md:pb-10 md:pt-8">

          <div className="mx-auto w-full max-w-5xl space-y-6">

            {
              children
            }

            {AD_ENABLED_PATHS.has(pathname) ? (
              <AdSlot
                id={`app-shell-${pathname.slice(1).replaceAll("/", "-")}`}
                size="banner"
                className="mt-8"
              />
            ) : null}

            {/* ===========================================
                RODAPÉ
               =========================================== */}

            <footer className="mt-12 border-t border-border pt-6">

              <div className="flex flex-col items-center justify-between gap-4 pb-4 text-center sm:flex-row sm:text-left">

                <p className="text-xs text-muted-foreground">
                  © {new Date().getFullYear()} FinanLook.
                  Todos os direitos reservados.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">

                  <Link
                    to="/politica-de-privacidade"
                    className="transition-colors hover:text-foreground"
                  >
                    Política de Privacidade
                  </Link>

                  <Link
                    to="/termos-de-uso"
                    className="transition-colors hover:text-foreground"
                  >
                    Termos de Uso
                  </Link>

                  <Link
                    to="/cookies"
                    className="transition-colors hover:text-foreground"
                  >
                    Cookies
                  </Link>

                </div>

              </div>

            </footer>

          </div>

        </main>

      </div>

      {/* =================================================
          NAVEGAÇÃO MOBILE
         ================================================= */}

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 gap-1 border-t border-border bg-background/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-1.5 backdrop-blur md:hidden">

        {/* ===============================================
            4 PRINCIPAIS
           =============================================== */}

        {
          MOBILE_MAIN.map(
            ({
              to,
              label,
              icon: Icon,
            }) => (
              <Link
                key={
                  to
                }
                to={
                  to
                }
                className={
                  cn(
                    "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition-colors sm:text-[11px]",

                    pathname ===
                    to
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )
                }
              >
                <Icon className="size-5 shrink-0" />

                <span className="w-full truncate text-center">

                  {
                    label ===
                    "Organizar salário"
                      ? "Organizar"
                      : label
                  }

                </span>

              </Link>
            ),
          )
        }

        {/* ===============================================
            MAIS

            ÚNICO BOTÃO QUE ABRE
            O MENU MOBILE.
           =============================================== */}

        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              true,
            )
          }
          className={
            cn(
              "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition-colors sm:text-[11px]",

              isMoreActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground",
            )
          }
        >
          <Menu className="size-5 shrink-0" />

          <span className="w-full truncate text-center">
            Mais
          </span>

        </button>

      </nav>

    </div>
  );
}

/* =========================================================
   CARD PREMIUM
   ========================================================= */

function PremiumCard({
  isPremium,
  onClick,
}: {
  isPremium: boolean;
  onClick: () => void;
}) {
  if (
    isPremium
  ) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">

        <div className="flex items-center gap-2">

          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Crown className="size-4 text-primary" />
          </div>

          <div className="min-w-0">

            <p className="text-sm font-semibold">
              FinanLook Premium
            </p>

            <p className="text-xs text-muted-foreground">
              Seu plano está ativo.
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="w-full rounded-2xl border border-primary/20 bg-primary/5 p-3 text-left transition-colors hover:bg-primary/10"
    >

      <div className="flex items-center gap-3">

        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="size-4 text-primary" />
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-sm font-semibold">
            Atualizar para Premium
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Desbloqueie recursos avançados.
          </p>

        </div>

        <Crown className="size-4 shrink-0 text-primary" />

      </div>

    </button>
  );
}

/* =========================================================
   ITEM DE NAVEGAÇÃO
   ========================================================= */

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  to: string;

  label: string;

  icon:
    typeof LayoutDashboard;

  active: boolean;

  onNavigate?: () => void;
}) {
  return (
    <Link
      to={
        to
      }
      onClick={
        onNavigate
      }
      className={
        cn(
          "flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",

          active
            ? "bg-sidebar-primary/12 text-sidebar-primary"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )
      }
    >
      <Icon className="size-[18px] shrink-0" />

      <span className="truncate">
        {
          label
        }
      </span>

    </Link>
  );
}