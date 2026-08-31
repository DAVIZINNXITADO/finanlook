import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "@/components/theme-provider";

/* =========================================================
   404
   ========================================================= */

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Página não encontrada
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ERRO
   ========================================================= */

function ErrorComponent({
  error,
}: {
  error: Error;
}) {
  console.error("ERRO DA APLICAÇÃO:", error);

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-2xl border border-destructive/30 bg-card p-6 shadow-lg">
          <div className="text-center">
            <div className="text-5xl">
              ⚠️
            </div>

            <h1 className="mt-4 text-2xl font-bold text-foreground">
              Oops! Algo deu errado
            </h1>

            <p className="mt-3 text-muted-foreground">
              Ocorreu um erro ao carregar esta página.
            </p>
          </div>

          {/* =================================================
              ERRO REAL
             ================================================= */}

          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-foreground">
              Erro encontrado:
            </p>

            <pre className="max-h-[400px] overflow-auto rounded-xl bg-muted p-4 text-left text-xs leading-6 text-destructive whitespace-pre-wrap break-words">
              {error?.message ||
                String(error) ||
                "Erro desconhecido"}
            </pre>
          </div>

          {/* =================================================
              DETALHES
             ================================================= */}

          {error?.stack && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Ver detalhes técnicos
              </summary>

              <pre className="mt-3 max-h-[300px] overflow-auto rounded-xl bg-muted p-4 text-left text-xs leading-6 text-muted-foreground whitespace-pre-wrap break-words">
                {error.stack}
              </pre>
            </details>
          )}

          {/* =================================================
              VOLTAR
             ================================================= */}

          <div className="mt-6 flex justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Voltar ao início
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ROOT ROUTE
   ========================================================= */

export const Route =
  createRootRouteWithContext<{
    queryClient: QueryClient;
  }>()({
    head: () => ({
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title:
            "FinanLook — organize seu dinheiro de forma simples",
        },
        {
          name: "description",
          content:
            "Controle entradas, gastos, reserva de emergência e metas em um app simples de organização financeira pessoal.",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
      ],

      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap",
        },
        {
          rel: "icon",
          href: "/favicon.png",
          type: "image/png",
        },
      ],
    }),

    shellComponent: RootShell,

    component: RootComponent,

    notFoundComponent:
      NotFoundComponent,

    errorComponent:
      ErrorComponent,
  });

/* =========================================================
   HTML SHELL
   ========================================================= */

function RootShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>

      <body>
        {children}

        <Scripts />
      </body>
    </html>
  );
}

/* =========================================================
   ROOT COMPONENT
   ========================================================= */

function RootComponent() {
  const { queryClient } =
    Route.useRouteContext();

  const router =
    useRouter();

  useEffect(() => {
    const { data } =
      supabase.auth.onAuthStateChange(
        (event) => {
          if (
            event !== "SIGNED_IN" &&
            event !== "SIGNED_OUT" &&
            event !== "USER_UPDATED"
          ) {
            return;
          }

          void router.invalidate();

          if (
            event !== "SIGNED_OUT"
          ) {
            void queryClient.invalidateQueries();
          }
        },
      );

    return () => {
      data.subscription.unsubscribe();
    };
  }, [
    router,
    queryClient,
  ]);

  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="finanlook-theme"
    >
      <QueryClientProvider
        client={queryClient}
      >
        <Outlet />

        <Toaster
          position="top-center"
          richColors
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}