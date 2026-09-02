import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  buildThemeColorVars,
  getThemeColor,
  DEFAULT_CUSTOM_COLOR,
  type ThemeColorKey,
} from "@/lib/theme-colors";

/* =========================================================
   TIPOS
   ========================================================= */

export type Theme =
  | "light"
  | "dark"
  | "system";

export type ThemeStyle =
  | "real"
  | "verdant";

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

  resolvedTheme:
    | "light"
    | "dark";

  themeColor: ThemeColorKey;

  setThemeColor: (
    color: ThemeColorKey,
  ) => void;

  customColor: string;

  setCustomColor: (
    hex: string,
  ) => void;

  themeStyle: ThemeStyle;

  setThemeStyle: (
    style: ThemeStyle,
  ) => void;
};

/* =========================================================
   CONTEXTO
   ========================================================= */

const ThemeProviderContext =
  createContext<
    ThemeProviderState | undefined
  >(undefined);

/* =========================================================
   STORAGE KEYS
   ========================================================= */

const COLOR_STORAGE_KEY =
  "finanlook-theme-color";

const CUSTOM_STORAGE_KEY =
  "finanlook-theme-custom-color";

const STYLE_STORAGE_KEY =
  "finanlook-theme-style";

/* =========================================================
   SISTEMA
   ========================================================= */

function getSystemTheme():
  | "light"
  | "dark" {
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
   PROVIDER
   ========================================================= */

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "finanlook-theme",
}: ThemeProviderProps) {
  /* =======================================================
     ESTADO DO TEMA CLARO / ESCURO
     ======================================================= */

  const [
    theme,
    setThemeState,
  ] =
    useState<Theme>(
      defaultTheme,
    );

  const [
    resolvedTheme,
    setResolvedTheme,
  ] =
    useState<
      "light" | "dark"
    >("light");

  /* =======================================================
     COR
     ======================================================= */

  const [
    themeColor,
    setThemeColorState,
  ] =
    useState<ThemeColorKey>(
      "classic",
    );

  const [
    customColor,
    setCustomColorState,
  ] =
    useState<string>(
      DEFAULT_CUSTOM_COLOR,
    );

  /* =======================================================
     ESTILO DA COR
     ======================================================= */

  const [
    themeStyle,
    setThemeStyleState,
  ] =
    useState<ThemeStyle>(
      "real",
    );

  /* =======================================================
     CARREGAR PREFERÊNCIAS
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

    /* ----------------------------------------------------- */

    const savedColor =
      window.localStorage.getItem(
        COLOR_STORAGE_KEY,
      ) as ThemeColorKey | null;

    if (
      savedColor &&
      getThemeColor(
        savedColor,
      ).key === savedColor
    ) {
      setThemeColorState(
        savedColor,
      );
    }

    /* ----------------------------------------------------- */

    const savedCustom =
      window.localStorage.getItem(
        CUSTOM_STORAGE_KEY,
      );

    if (
      savedCustom &&
      /^#[0-9a-fA-F]{6}$/.test(
        savedCustom,
      )
    ) {
      setCustomColorState(
        savedCustom,
      );
    }

    /* ----------------------------------------------------- */

    const savedStyle =
      window.localStorage.getItem(
        STYLE_STORAGE_KEY,
      );

    if (
      savedStyle === "real" ||
      savedStyle === "verdant"
    ) {
      setThemeStyleState(
        savedStyle,
      );
    }
  }, [
    storageKey,
  ]);

  /* =======================================================
     APLICAR CLARO / ESCURO
     ======================================================= */

  useEffect(() => {
    const root =
      window.document
        .documentElement;

    function applyTheme(
      selectedTheme: Theme,
    ) {
      const resolved =
        selectedTheme ===
        "system"
          ? getSystemTheme()
          : selectedTheme;

      root.classList.toggle(
        "dark",
        resolved === "dark",
      );

      setResolvedTheme(
        resolved,
      );
    }

    applyTheme(
      theme,
    );

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
     APLICAR PALETA
     ======================================================= */

  useEffect(() => {
    const root =
      window.document
        .documentElement;

    /*
     * buildThemeColorVars agora recebe também
     * o estilo escolhido.
     */

    const vars =
      buildThemeColorVars(
        themeColor,
        resolvedTheme,
        customColor,
        themeStyle,
      );

    const keys = [
      "--primary",
      "--primary-foreground",
      "--ring",
      "--accent",
      "--accent-foreground",
      "--sidebar-primary",
      "--sidebar-primary-foreground",
      "--sidebar-accent",
      "--sidebar-accent-foreground",
      "--sidebar-ring",
      "--chart-1",
    ];

    /*
     * Remove as variáveis anteriores antes
     * de aplicar as novas.
     */

    keys.forEach(
      (key) => {
        root.style.removeProperty(
          key,
        );
      },
    );

    if (
      !vars
    ) {
      return;
    }

    Object.entries(
      vars,
    ).forEach(
      ([
        key,
        value,
      ]) => {
        root.style.setProperty(
          key,
          value,
        );
      },
    );
  }, [
    themeColor,
    customColor,
    resolvedTheme,
    themeStyle,
  ]);

  /* =======================================================
     AÇÕES
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

  function setThemeColor(
    color: ThemeColorKey,
  ) {
    window.localStorage.setItem(
      COLOR_STORAGE_KEY,
      color,
    );

    setThemeColorState(
      color,
    );
  }

  function setCustomColor(
    hex: string,
  ) {
    if (
      !/^#[0-9a-fA-F]{6}$/.test(
        hex,
      )
    ) {
      return;
    }

    window.localStorage.setItem(
      CUSTOM_STORAGE_KEY,
      hex,
    );

    setCustomColorState(
      hex,
    );
  }

  function setThemeStyle(
    style: ThemeStyle,
  ) {
    window.localStorage.setItem(
      STYLE_STORAGE_KEY,
      style,
    );

    setThemeStyleState(
      style,
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

        resolvedTheme,

        themeColor,
        setThemeColor,

        customColor,
        setCustomColor,

        themeStyle,
        setThemeStyle,
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

  if (
    !context
  ) {
    throw new Error(
      "useTheme must be used inside ThemeProvider.",
    );
  }

  return context;
}