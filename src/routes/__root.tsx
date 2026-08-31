import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import {
  useEffect,
  type ReactNode,
} from "react";

import appCss from "../styles.css?url";

import {
  Toaster,
} from "@/components/ui/sonner";

import {
  supabase,
} from "@/integrations/supabase/client";

import {
  ThemeProvider,
} from "@/components/theme-provider";

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
          content:
            "width=device-width, initial-scale=1",
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
          content:
            "summary_large_image",
        },
      ],

      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "preconnect",
          href:
            "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href:
            "https://fonts.gstatic.com",
          crossOrigin:
            "anonymous",
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

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storageKey = "finanlook-theme";

                  const savedTheme =
                    localStorage.getItem(storageKey) ||
                    "system";

                  const html =
                    document.documentElement;

                  html.classList.remove(
                    "light",
                    "dark"
                  );

                  let resolvedTheme =
                    savedTheme;

                  if (
                    savedTheme === "system"
                  ) {
                    const isDark =
                      window.matchMedia(
                        "(prefers-color-scheme: dark)"
                      ).matches;

                    resolvedTheme =
                      isDark
                        ? "dark"
                        : "light";
                  }

                  html.classList.add(
                    resolvedTheme
                  );

                  html.style.colorScheme =
                    resolvedTheme;
                } catch (error) {
                  console.error(
                    "Erro ao carregar tema:",
                    error
                  );
                }
              })();
            `,
          }}
        />
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
  const {
    queryClient,
  } =
    Route.useRouteContext();

  const router =
    useRouter();

  useEffect(() => {
    const {
      data,
    } =
      supabase.auth.onAuthStateChange(
        (event) => {
          if (
            event !==
              "SIGNED_IN" &&
            event !==
              "SIGNED_OUT" &&
            event !==
              "USER_UPDATED"
          ) {
            return;
          }

          void router.invalidate();

          if (
            event !==
            "SIGNED_OUT"
          ) {
            void queryClient.invalidateQueries();
          }
        }
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