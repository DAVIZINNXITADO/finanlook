import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  buildThemeColorVars,
  buildInterfaceStyleVars,
  getThemeColor,
  DEFAULT_CUSTOM_COLOR,
  DEFAULT_INTERFACE_STYLE,
  type ThemeColorKey,
  type InterfaceStyleKey,
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

  interfaceStyle: InterfaceStyleKey;

  setInterfaceStyle: (
    style: InterfaceStyleKey,
  ) => void;
};

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

const INTERFACE_STYLE_STORAGE_KEY =
  "finanlook-interface-style";

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
  ] = useState<Theme>(
    defaultTheme,
  );

  const [
    resolvedTheme,
    setResolvedTheme,
  ] = useState<
    "light" | "dark"
  >("light");

  const [
    themeColor,
    setThemeColorState,
  ] = useState<ThemeColorKey>(
    "classic",
  );

  const [
    customColor,
    setCustomColorState,
  ] = useState<string>(
    DEFAULT_CUSTOM_COLOR,
  );

  const [
    interfaceStyle,
    setInterfaceStyleState,
  ] =
    useState<InterfaceStyleKey>(
      DEFAULT_INTERFACE_STYLE,
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

    const savedInterfaceStyle =
      window.localStorage.getItem(
        INTERFACE_STYLE_STORAGE_KEY,
      );

    if (
      savedInterfaceStyle ===
        "neutral" ||
      savedInterfaceStyle ===
        "emerald"
    ) {
      setInterfaceStyleState(
        savedInterfaceStyle,
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
     APLICAR ESTILO DA INTERFACE
     ======================================================= */

  useEffect(() => {
    const root =
      window.document
        .documentElement;

    const vars =
      buildInterfaceStyleVars(
        interfaceStyle,
        resolvedTheme,
      );

    const keys = [
      "--background",

      "--foreground",

      "--card",

      "--card-foreground",

      "--popover",

      "--popover-foreground",

      "--secondary",

      "--secondary-foreground",

      "--muted",

      "--muted-foreground",

      "--border",

      "--input",

      "--sidebar-background",

      "--sidebar-foreground",

      "--sidebar-border",
    ];

    keys.forEach(
      (key) => {
        root.style.removeProperty(
          key,
        );
      },
    );

    Object.entries(
      vars,
    ).forEach(
      ([key, value]) => {
        root.style.setProperty(
          key,
          value,
        );
      },
    );
  }, [
    interfaceStyle,
    resolvedTheme,
  ]);

  /* =======================================================
     APLICAR COR PRINCIPAL
     ======================================================= */

  useEffect(() => {
    const root =
      window.document
        .documentElement;

    const vars =
      buildThemeColorVars(
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
      ([key, value]) => {
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

  function setInterfaceStyle(
    style: InterfaceStyleKey,
  ) {
    window.localStorage.setItem(
      INTERFACE_STYLE_STORAGE_KEY,
      style,
    );

    setInterfaceStyleState(
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

        interfaceStyle,

        setInterfaceStyle,
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