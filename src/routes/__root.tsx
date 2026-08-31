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
  reportLovableError,
} from "../lib/lovable-error-reporting";

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
   NOT FOUND
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
   ERROR COMPONENT
   ========================================================= */

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router =
    useRouter();

  console.error(
    "ERRO COMPLETO DA APLICAÇÃO:",
    error,
  );

  useEffect(() => {
    try {
      reportLovableError(
        error,
        {
          boundary:
            "tanstack_root_error_component",
        },
      );
    } catch (
      reportError,
    ) {
      console.error(
        "Erro ao reportar erro:",
        reportError,
      );
    }
  }, [
    error,
  ]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : String(error);

  const errorStack =
    error instanceof Error
      ? error.stack ||
        "Stack não disponível."
      : String(error);

  return (
    <div className="min-h-screen bg-background p-4 text-foreground">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-2xl border border-destructive/30 bg-card p-5 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-destructive">
            Erro da aplicação
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Ocorreu um erro ao carregar esta página.
            A mensagem completa está abaixo.
          </p>

          {/* =============================================
              MENSAGEM
             ============================================= */}

          <div className="mt-6">
            <h2 className="mb-2 font-semibold">
              Mensagem do erro
            </h2>

            <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left text-xs text-destructive sm:text-sm">
              {errorMessage}
            </pre>
          </div>

          {/* =============================================
              STACK
             ============================================= */}

          <div className="mt-6">
            <h2 className="mb-2 font-semibold">
              Stack completo
            </h2>

            <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border bg-muted p-4 text-left text-[11px] leading-relaxed text-foreground sm:text-xs">
              {errorStack}
            </pre>
          </div>

          {/* =============================================
              AÇÕES
             ============================================= */}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                void router.invalidate();

                reset();
              }}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Tentar novamente
            </button>

            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Ir para o início
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
          href:
            "/favicon.png",
          type:
            "image/png",
        },
      ],
    }),

    shellComponent:
      RootShell,

    component:
      RootComponent,

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

        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var storageKey = "finanlook-theme";

    var savedTheme =
      localStorage.getItem(
        storageKey,
      ) || "system";

    var html =
      document.documentElement;

    html.classList.remove(
      "light",
      "dark",
    );

    var resolvedTheme =
      savedTheme;

    if (
      savedTheme === "system"
    ) {
      var isDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;

      resolvedTheme =
        isDark
          ? "dark"
          : "light";
    }

    html.classList.add(
      resolvedTheme,
    );

    html.style.colorScheme =
      resolvedTheme;

  } catch (error) {
    console.error(
      "Erro ao carregar tema:",
      error,
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
        (
          event,
        ) => {
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