import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme =
  | "light"
  | "dark"
  | "system";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (
    theme: Theme,
  ) => void;
};

const ThemeProviderContext =
  createContext<
    ThemeProviderState | undefined
  >(undefined);

/* =========================================================
   SISTEMA
   ========================================================= */

function getSystemTheme(): "light" | "dark" {
  if (
    typeof window ===
    "undefined"
  ) {
    return "light";
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}

/* =========================================================
   THEME PROVIDER
   ========================================================= */

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "finanlook-theme",
}: ThemeProviderProps) {
  const [
    theme,
    setThemeState,
  ] =
    useState<Theme>(
      defaultTheme,
    );

  /* =======================================================
     CARREGAR TEMA SALVO
     ======================================================= */

  useEffect(() => {
    const savedTheme =
      window.localStorage.getItem(
        storageKey,
      );

    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      setThemeState(
        savedTheme,
      );
    }
  }, [
    storageKey,
  ]);

  /* =======================================================
     APLICAR TEMA
     ======================================================= */

  useEffect(() => {
    const root =
      window.document.documentElement;

    function applyTheme(
      selectedTheme: Theme,
    ) {
      const resolvedTheme =
        selectedTheme === "system"
          ? getSystemTheme()
          : selectedTheme;

      /*
       * Nosso CSS usa :root
       * para o tema claro.
       *
       * Então só precisamos da classe
       * .dark quando o tema resolvido
       * for escuro.
       */

      root.classList.toggle(
        "dark",
        resolvedTheme ===
          "dark",
      );
    }

    applyTheme(theme);

    /*
     * Se o usuário escolheu claro ou escuro
     * manualmente, não precisamos escutar
     * mudanças do sistema.
     */

    if (
      theme !==
      "system"
    ) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

    function handleChange() {
      applyTheme(
        "system",
      );
    }

    mediaQuery.addEventListener(
      "change",
      handleChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange,
      );
    };
  }, [
    theme,
  ]);

  /* =======================================================
     ALTERAR TEMA
     ======================================================= */

  function setTheme(
    newTheme: Theme,
  ) {
    window.localStorage.setItem(
      storageKey,
      newTheme,
    );

    setThemeState(
      newTheme,
    );
  }

  /* =======================================================
     PROVIDER
     ======================================================= */

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

/* =========================================================
   HOOK
   ========================================================= */

export function useTheme() {
  const context =
    useContext(
      ThemeProviderContext,
    );

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider.",
    );
  }

  return context;
}