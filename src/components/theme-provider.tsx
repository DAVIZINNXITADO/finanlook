import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* =========================================================
   TIPOS
   ========================================================= */

export type ThemeMode =
  | "light"
  | "dark"
  | "system";

export type ResolvedThemeMode =
  | "light"
  | "dark";

export type ThemeStyle =
  | "real"
  | "verdant";

export type ThemeColorKey =
  | "classic"
  | "gold"
  | "red"
  | "blue"
  | "yellow"
  | "green"
  | "purple"
  | "custom";

/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

export const DEFAULT_CUSTOM_COLOR =
  "#2f6df6";

const THEME_STORAGE_KEY =
  "finanlook-theme";

const THEME_COLOR_STORAGE_KEY =
  "finanlook-theme-color";

const CUSTOM_COLOR_STORAGE_KEY =
  "finanlook-custom-color";

const THEME_STYLE_STORAGE_KEY =
  "finanlook-theme-style";

/* =========================================================
   CORES
   ========================================================= */

type ThemeColor = {
  key: ThemeColorKey;
  hue: number;
  chroma: number;
  light: number;
  dark: number;
};

const THEME_COLORS: ThemeColor[] = [
  {
    key: "classic",
    hue: 162,
    chroma: 0.13,
    light: 0.56,
    dark: 0.72,
  },
  {
    key: "gold",
    hue: 85,
    chroma: 0.11,
    light: 0.62,
    dark: 0.78,
  },
  {
    key: "red",
    hue: 25,
    chroma: 0.17,
    light: 0.55,
    dark: 0.67,
  },
  {
    key: "blue",
    hue: 250,
    chroma: 0.14,
    light: 0.55,
    dark: 0.7,
  },
  {
    key: "yellow",
    hue: 95,
    chroma: 0.14,
    light: 0.72,
    dark: 0.84,
  },
  {
    key: "green",
    hue: 145,
    chroma: 0.15,
    light: 0.58,
    dark: 0.73,
  },
  {
    key: "purple",
    hue: 300,
    chroma: 0.15,
    light: 0.55,
    dark: 0.71,
  },
  {
    key: "custom",
    hue: 200,
    chroma: 0.13,
    light: 0.56,
    dark: 0.72,
  },
];

/* =========================================================
   UTILITÁRIOS DE COR
   ========================================================= */

export function getThemeColor(
  key: ThemeColorKey,
): ThemeColor {
  return (
    THEME_COLORS.find(
      (color) =>
        color.key === key,
    ) ??
    THEME_COLORS[0]!
  );
}

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(
    max,
    Math.max(
      min,
      value,
    ),
  );
}

function oklch(
  lightness: number,
  chroma: number,
  hue: number,
) {
  return `oklch(${lightness} ${chroma} ${hue})`;
}

function hexToRgb(
  hex: string,
) {
  const value =
    hex.replace(
      "#",
      "",
    );

  if (
    !/^[0-9a-fA-F]{6}$/.test(
      value,
    )
  ) {
    return {
      r: 47,
      g: 109,
      b: 246,
    };
  }

  return {
    r: parseInt(
      value.slice(
        0,
        2,
      ),
      16,
    ),

    g: parseInt(
      value.slice(
        2,
        4,
      ),
      16,
    ),

    b: parseInt(
      value.slice(
        4,
        6,
      ),
      16,
    ),
  };
}

function hexToOklch(
  hex: string,
) {
  const {
    r,
    g,
    b,
  } =
    hexToRgb(
      hex,
    );

  const red =
    r / 255;

  const green =
    g / 255;

  const blue =
    b / 255;

  const max =
    Math.max(
      red,
      green,
      blue,
    );

  const min =
    Math.min(
      red,
      green,
      blue,
    );

  const lightness =
    clamp(
      (
        max +
        min
      ) /
        2,
      0.48,
      0.78,
    );

  const chroma =
    clamp(
      (
        max -
        min
      ) *
        0.16,
      0.05,
      0.16,
    );

  let hue =
    220;

  if (
    max !== min
  ) {
    if (
      max === red
    ) {
      hue =
        60 *
        (
          (
            green -
            blue
          ) /
          (
            max -
            min
          )
        );
    } else if (
      max === green
    ) {
      hue =
        60 *
        (
          2 +
          (
            red -
            blue
          ) /
            (
              max -
              min
            )
        );
    } else {
      hue =
        60 *
        (
          4 +
          (
            red -
            green
          ) /
            (
              max -
              min
            )
        );
    }

    if (
      hue <
      0
    ) {
      hue +=
        360;
    }
  }

  return {
    lightness,
    chroma,
    hue,
  };
}

/* =========================================================
   VARIÁVEIS CSS DO TEMA
   ========================================================= */

export function buildThemeColorVars(
  key: ThemeColorKey,
  mode: ResolvedThemeMode,
  customHex: string,
  themeStyle?: ThemeStyle,
): Record<string, string> | null {
  if (
    key ===
    "classic"
  ) {
    return null;
  }

  const color =
    getThemeColor(
      key,
    );

  let hue =
    color.hue;

  let chroma =
    color.chroma;

  let lightness =
    mode ===
    "dark"
      ? color.dark
      : color.light;

  if (
    key ===
    "custom"
  ) {
    const parsed =
      hexToOklch(
        customHex,
      );

    hue =
      parsed.hue;

    chroma =
      parsed.chroma;

    lightness =
      mode ===
      "dark"
        ? clamp(
            parsed.lightness,
            0.62,
            0.84,
          )
        : clamp(
            parsed.lightness,
            0.48,
            0.68,
          );
  }

  if (
    themeStyle ===
    "verdant"
  ) {
    chroma =
      Math.min(
        chroma +
          0.005,
        0.16,
      );
  }

  const primary =
    oklch(
      lightness,
      chroma,
      hue,
    );

  const isLight =
    lightness >=
    0.68;

  const primaryForeground =
    isLight
      ? oklch(
          0.2,
          0.02,
          hue,
        )
      : oklch(
          0.98,
          0.01,
          hue,
        );

  const accent =
    mode ===
    "dark"
      ? oklch(
          0.32,
          Math.min(
            chroma,
            0.06,
          ),
          hue,
        )
      : oklch(
          0.93,
          Math.min(
            chroma,
            0.05,
          ),
          hue,
        );

  return {
    "--primary":
      primary,

    "--primary-foreground":
      primaryForeground,

    "--ring":
      primary,

    "--accent":
      accent,

    "--accent-foreground":
      mode ===
      "dark"
        ? "oklch(0.96 0.01 0)"
        : "oklch(0.3 0.03 0)",

    "--sidebar-primary":
      primary,

    "--sidebar-primary-foreground":
      primaryForeground,

    "--sidebar-accent":
      accent,

    "--sidebar-accent-foreground":
      mode ===
      "dark"
        ? "oklch(0.96 0.01 0)"
        : "oklch(0.3 0.03 0)",

    "--sidebar-ring":
      primary,

    "--chart-1":
      primary,
  };
}

/* =========================================================
   CONTEXT
   ========================================================= */

type ThemeProviderContext = {
  theme: ThemeMode;
  resolvedTheme: ResolvedThemeMode;

  color: ThemeColorKey;
  customColor: string;

  themeStyle: ThemeStyle;

  setTheme: (
    theme: ThemeMode,
  ) => void;

  setColor: (
    color: ThemeColorKey,
  ) => void;

  setCustomColor: (
    color: string,
  ) => void;

  setThemeStyle: (
    style: ThemeStyle,
  ) => void;
};

const ThemeContext =
  createContext<
    ThemeProviderContext |
    undefined
  >(
    undefined,
  );

/* =========================================================
   FUNÇÕES DE STORAGE
   ========================================================= */

function getStoredTheme(): ThemeMode {
  if (
    typeof window ===
    "undefined"
  ) {
    return "system";
  }

  const value =
    window.localStorage.getItem(
      THEME_STORAGE_KEY,
    );

  if (
    value === "light" ||
    value === "dark" ||
    value === "system"
  ) {
    return value;
  }

  return "system";
}

function getStoredColor(): ThemeColorKey {
  if (
    typeof window ===
    "undefined"
  ) {
    return "classic";
  }

  const value =
    window.localStorage.getItem(
      THEME_COLOR_STORAGE_KEY,
    );

  const valid =
    THEME_COLORS.some(
      (
        color,
      ) =>
        color.key ===
        value,
    );

  if (
    valid
  ) {
    return value as ThemeColorKey;
  }

  return "classic";
}

function getStoredCustomColor() {
  if (
    typeof window ===
    "undefined"
  ) {
    return DEFAULT_CUSTOM_COLOR;
  }

  return (
    window.localStorage.getItem(
      CUSTOM_COLOR_STORAGE_KEY,
    ) ??
    DEFAULT_CUSTOM_COLOR
  );
}

function getStoredThemeStyle(): ThemeStyle {
  if (
    typeof window ===
    "undefined"
  ) {
    return "real";
  }

  const value =
    window.localStorage.getItem(
      THEME_STYLE_STORAGE_KEY,
    );

  if (
    value ===
    "verdant"
  ) {
    return "verdant";
  }

  return "real";
}

/* =========================================================
   PROVIDER
   ========================================================= */

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    theme,
    setTheme,
  ] =
    useState<ThemeMode>(
      getStoredTheme,
    );

  const [
    color,
    setColor,
  ] =
    useState<ThemeColorKey>(
      getStoredColor,
    );

  const [
    customColor,
    setCustomColor,
  ] =
    useState(
      getStoredCustomColor,
    );

  const [
    themeStyle,
    setThemeStyle,
  ] =
    useState<ThemeStyle>(
      getStoredThemeStyle,
    );

  const [
    resolvedTheme,
    setResolvedTheme,
  ] =
    useState<ResolvedThemeMode>(
      "light",
    );

  /* =======================================================
     RESOLVE LIGHT / DARK / SYSTEM
     ======================================================= */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const media =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

    function resolveTheme() {
      const nextTheme =
        theme ===
        "system"
          ? (
              media.matches
                ? "dark"
                : "light"
            )
          : theme;

      setResolvedTheme(
        nextTheme,
      );
    }

    resolveTheme();

    media.addEventListener(
      "change",
      resolveTheme,
    );

    return () => {
      media.removeEventListener(
        "change",
        resolveTheme,
      );
    };
  }, [
    theme,
  ]);

  /* =======================================================
     APLICA TEMA
     ======================================================= */

  useEffect(() => {
    if (
      typeof document ===
      "undefined"
    ) {
      return;
    }

    const root =
      document.documentElement;

    root.classList.remove(
      "light",
      "dark",
    );

    root.classList.add(
      resolvedTheme,
    );

    root.style.colorScheme =
      resolvedTheme;

    const vars =
      buildThemeColorVars(
        color,
        resolvedTheme,
        customColor,
        themeStyle,
      );

    const variableNames = [
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

    variableNames.forEach(
      (
        variable,
      ) => {
        root.style.removeProperty(
          variable,
        );
      },
    );

    if (
      vars
    ) {
      Object.entries(
        vars,
      ).forEach(
        (
          [
            variable,
            value,
          ],
        ) => {
          root.style.setProperty(
            variable,
            value,
          );
        },
      );
    }
  }, [
    color,
    customColor,
    resolvedTheme,
    themeStyle,
  ]);

  /* =======================================================
     SALVA TEMA
     ======================================================= */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      theme,
    );
  }, [
    theme,
  ]);

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    window.localStorage.setItem(
      THEME_COLOR_STORAGE_KEY,
      color,
    );
  }, [
    color,
  ]);

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    window.localStorage.setItem(
      CUSTOM_COLOR_STORAGE_KEY,
      customColor,
    );
  }, [
    customColor,
  ]);

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    window.localStorage.setItem(
      THEME_STYLE_STORAGE_KEY,
      themeStyle,
    );
  }, [
    themeStyle,
  ]);

  /* =======================================================
     CONTEXT VALUE
     ======================================================= */

  const value =
    useMemo<
      ThemeProviderContext
    >(
      () => ({
        theme,
        resolvedTheme,

        color,
        customColor,

        themeStyle,

        setTheme,
        setColor,
        setCustomColor,
        setThemeStyle,
      }),
      [
        theme,
        resolvedTheme,
        color,
        customColor,
        themeStyle,
      ],
    );

  return (
    <ThemeContext.Provider
      value={
        value
      }
    >
      {children}
    </ThemeContext.Provider>
  );
}

/* =========================================================
   HOOK
   ========================================================= */

export function useTheme() {
  const context =
    useContext(
      ThemeContext,
    );

  if (
    !context
  ) {
    throw new Error(
      "useTheme deve ser usado dentro de ThemeProvider.",
    );
  }

  return context;
}