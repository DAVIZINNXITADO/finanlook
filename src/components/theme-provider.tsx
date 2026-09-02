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
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  themeColor: ThemeColorKey;
  setThemeColor: (color: ThemeColorKey) => void;
  customColor: string;
  setCustomColor: (hex: string) => void;
};

const ThemeProviderContext =
  createContext<ThemeProviderState | undefined>(
    undefined,
  );

const COLOR_STORAGE_KEY =
  "finanlook-theme-color";

const CUSTOM_STORAGE_KEY =
  "finanlook-theme-custom-color";

/* =========================================================
   SISTEMA
   ========================================================= */

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
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
  ] = useState<Theme>(defaultTheme);

  const [
    resolvedTheme,
    setResolvedTheme,
  ] = useState<"light" | "dark">("light");

  const [
    themeColor,
    setThemeColorState,
  ] = useState<ThemeColorKey>("classic");

  const [
    customColor,
    setCustomColorState,
  ] = useState<string>(DEFAULT_CUSTOM_COLOR);

  /* =======================================================
     CARREGAR PREFERÊNCIAS SALVAS
     ======================================================= */

  useEffect(() => {
    const savedTheme =
      window.localStorage.getItem(storageKey);

    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      setThemeState(savedTheme);
    }

    const savedColor =
      window.localStorage.getItem(
        COLOR_STORAGE_KEY,
      ) as ThemeColorKey | null;

    if (
      savedColor &&
      getThemeColor(savedColor).key === savedColor
    ) {
      setThemeColorState(savedColor);
    }

    const savedCustom =
      window.localStorage.getItem(
        CUSTOM_STORAGE_KEY,
      );

    if (
      savedCustom &&
      /^#[0-9a-fA-F]{6}$/.test(savedCustom)
    ) {
      setCustomColorState(savedCustom);
    }
  }, [storageKey]);

  /* =======================================================
     APLICAR CLARO / ESCURO
     ======================================================= */

  useEffect(() => {
    const root = window.document.documentElement;

    function applyTheme(selectedTheme: Theme) {
      const resolved =
        selectedTheme === "system"
          ? getSystemTheme()
          : selectedTheme;

      root.classList.toggle(
        "dark",
        resolved === "dark",
      );

      setResolvedTheme(resolved);
    }

    applyTheme(theme);

    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    function handleChange() {
      applyTheme("system");
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
  }, [theme]);

  /* =======================================================
     APLICAR PALETA DE COR
     ======================================================= */

  useEffect(() => {
    const root = window.document.documentElement;

    const vars = buildThemeColorVars(
      themeColor,
      resolvedTheme,
      customColor,
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

    keys.forEach((key) => {
      root.style.removeProperty(key);
    });

    if (!vars) {
      return;
    }

    Object.entries(vars).forEach(
      ([key, value]) => {
        root.style.setProperty(key, value);
      },
    );
  }, [
    themeColor,
    customColor,
    resolvedTheme,
  ]);

  /* =======================================================
     AÇÕES
     ======================================================= */

  function setTheme(newTheme: Theme) {
    window.localStorage.setItem(
      storageKey,
      newTheme,
    );

    setThemeState(newTheme);
  }

  function setThemeColor(color: ThemeColorKey) {
    window.localStorage.setItem(
      COLOR_STORAGE_KEY,
      color,
    );

    setThemeColorState(color);
  }

  function setCustomColor(hex: string) {
    window.localStorage.setItem(
      CUSTOM_STORAGE_KEY,
      hex,
    );

    setCustomColorState(hex);
  }

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
  const context = useContext(
    ThemeProviderContext,
  );

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider.",
    );
  }

  return context;
}
