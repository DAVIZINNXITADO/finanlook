import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ChevronLeft,
  Landmark,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Target,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type NavItem = {
  title: string;
  to: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

const navigation: NavItem[] = [
  {
    title: "Visão Geral",
    to: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Movimentações",
    to: "/movimentacoes",
    icon: ArrowLeftRight,
  },
  {
    title: "Contas",
    to: "/contas",
    icon: Landmark,
  },
  {
    title: "Organizar salário",
    to: "/organizar-salario",
    icon: WalletCards,
  },
  {
    title: "Reserva",
    to: "/reserva",
    icon: ShieldCheck,
  },
  {
    title: "Metas",
    to: "/metas",
    icon: Target,
  },
  {
    title: "Investimentos",
    to: "/investimentos",
    icon: TrendingUp,
  },
];

function AppShell() {
  const location = useLocation();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const isActive = (to: string) => {
    if (to === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === to ||
      location.pathname.startsWith(
        `${to}/`,
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* MOBILE HEADER */}

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            F
          </span>

          <span>
            FinanLook
          </span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setMobileOpen(
              (value) =>
                !value,
            )
          }
          aria-label="Abrir menu"
        >
          {mobileOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </Button>
      </header>

      <div className="flex">
        {/* SIDEBAR */}

        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-background transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full",
          ].join(" ")}
        >
          {/* LOGO */}

          <div className="flex h-16 items-center justify-between border-b px-5">
            <Link
              to="/"
              className="flex items-center gap-3 font-bold"
              onClick={() =>
                setMobileOpen(
                  false,
                )
              }
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground">
                F
              </span>

              <span className="text-lg">
                FinanLook
              </span>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() =>
                setMobileOpen(
                  false,
                )
              }
              aria-label="Fechar menu"
            >
              <ChevronLeft className="size-5" />
            </Button>
          </div>

          {/* NAVEGAÇÃO */}

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {navigation.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isActive(
                    item.to,
                  );

                return (
                  <Link
                    key={
                      item.to
                    }
                    to={
                      item.to
                    }
                    onClick={() =>
                      setMobileOpen(
                        false,
                      )
                    }
                    className={[
                      "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(
                      " ",
                    )}
                  >
                    <Icon className="size-5 shrink-0" />

                    <span>
                      {
                        item.title
                      }
                    </span>
                  </Link>
                );
              },
            )}
          </nav>

          {/* RODAPÉ SIDEBAR */}

          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">
              Organize sua vida
              financeira.
            </p>
          </div>
        </aside>

        {/* OVERLAY MOBILE */}

        {mobileOpen ? (
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() =>
              setMobileOpen(
                false,
              )
            }
          />
        ) : null}

        {/* CONTEÚDO */}

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export {
  AppShell,
};