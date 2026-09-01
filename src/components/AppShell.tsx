import {
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import {
  ArrowLeftRight,
  CalendarRange,
  ChartPie,
  Goal,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
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
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  cn,
} from "@/lib/utils";

import {
  useProfile,
} from "@/lib/data";

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

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  const pathname =
    useRouterState({
      select: (state) =>
        state.location.pathname,
    });

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
          <img
            src="/favicon.png"
            alt="FinanLook"
            className="size-9 rounded-xl object-contain"
          />

          <span className="font-display text-lg font-semibold">
            FinanLook
          </span>
        </Link>

        {/* NAVEGAÇÃO */}

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(
            (item) => (
              <NavItem
                key={item.to}
                {...item}
                active={
                  pathname ===
                  item.to
                }
              />
            ),
          )}
        </nav>

        {/* USUÁRIO */}

        <div className="mt-4 rounded-2xl bg-sidebar-accent/60 p-3">
          <p className="truncate text-sm font-medium">
            {profile?.name ||
              "Você"}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {profile?.username
              ? `@${profile.username}`
              : ""}
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
           =============================================== */}

        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <Link
            to="/visao-geral"
            className="flex min-w-0 items-center gap-2"
          >
            <img
              src="/favicon.png"
              alt="FinanLook"
              className="size-8 shrink-0 rounded-lg object-contain"
            />

            <span className="truncate font-display text-base font-semibold">
              FinanLook
            </span>
          </Link>

          <Sheet
            open={menuOpen}
            onOpenChange={
              setMenuOpen
            }
          >
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="flex w-[85vw] max-w-xs flex-col p-4"
            >
              <SheetTitle className="font-display">
                Menu
              </SheetTitle>

              {/* USUÁRIO */}

              <div className="mt-4 rounded-xl bg-secondary p-3">
                <p className="truncate text-sm font-medium">
                  {profile?.name ||
                    "Você"}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {profile?.username
                    ? `@${profile.username}`
                    : ""}
                </p>
              </div>

              {/* NAVEGAÇÃO */}

              <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto">
                {NAV.map(
                  (item) => (
                    <NavItem
                      key={item.to}
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
                )}
              </nav>

              {/* LOGOUT */}

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
        </header>

        {/* ===============================================
            CONTEÚDO
           =============================================== */}

        <main className="w-full px-4 pb-28 pt-5 sm:px-6 md:pb-10 md:pt-8">
          <div className="mx-auto w-full max-w-5xl space-y-6">
            {children}

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
        {/* 4 PRINCIPAIS */}

        {MOBILE_MAIN.map(
          ({
            to,
            label,
            icon: Icon,
          }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition-colors sm:text-[11px]",

                pathname ===
                  to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="size-5 shrink-0" />

              <span className="w-full truncate text-center">
                {label ===
                "Organizar salário"
                  ? "Organizar"
                  : label}
              </span>
            </Link>
          ),
        )}

        {/* MAIS */}

        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              true,
            )
          }
          className={cn(
            "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition-colors sm:text-[11px]",

            isMoreActive
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground",
          )}
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
      to={to}
      onClick={
        onNavigate
      }
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",

        active
          ? "bg-sidebar-primary/12 text-sidebar-primary"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-[18px] shrink-0" />

      <span className="truncate">
        {label}
      </span>
    </Link>
  );
}