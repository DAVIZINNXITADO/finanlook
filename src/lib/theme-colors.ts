/* =========================================================
   THEME COLORS
   src/lib/theme-colors.ts
   ========================================================= */

export type ThemeColorKey =
  | "classic"
  | "gold"
  | "red"
  | "blue"
  | "yellow"
  | "green"
  | "purple"
  | "custom";

export type ThemeStyle =
  | "real"
  | "verdant";

export type ThemeMode =
  | "light"
  | "dark";

/* =========================================================
   DEFAULT CUSTOM COLOR
   ========================================================= */

export const DEFAULT_CUSTOM_COLOR =
  "#2f6df6";

/* =========================================================
   COLOR CONFIGURATION
   ========================================================= */

export type ThemeColor = {
  key: ThemeColorKey;
  label: string;
  description: string;
  premium: boolean;
  hue: number;
  chroma: number;
  light: number;
  dark: number;
};

export const THEME_COLORS: ThemeColor[] = [
  {
    key: "classic",
    label: "Clássico",
    description: "A paleta original do FinanLook",
    premium: false,
    hue: 162,
    chroma: 0.13,
    light: 0.56,
    dark: 0.72,
  },

  {
    key: "gold",
    label: "Dourado",
    description: "Um destaque quente e acolhedor",
    premium: false,
    hue: 85,
    chroma: 0.11,
    light: 0.62,
    dark: 0.78,
  },

  {
    key: "red",
    label: "Coral",
    description: "Uma paleta vibrante e energética",
    premium: false,
    hue: 25,
    chroma: 0.17,
    light: 0.55,
    dark: 0.67,
  },

  {
    key: "blue",
    label: "Azul",
    description: "Uma paleta tranquila e confiável",
    premium: false,
    hue: 250,
    chroma: 0.14,
    light: 0.55,
    dark: 0.7,
  },

  {
    key: "yellow",
    label: "Amarelo",
    description: "Uma paleta iluminada e otimista",
    premium: false,
    hue: 95,
    chroma: 0.14,
    light: 0.72,
    dark: 0.84,
  },

  {
    key: "green",
    label: "Verde",
    description: "Uma paleta natural e equilibrada",
    premium: false,
    hue: 145,
    chroma: 0.15,
    light: 0.58,
    dark: 0.73,
  },

  {
    key: "purple",
    label: "Roxo",
    description: "Uma paleta criativa e marcante",
    premium: false,
    hue: 300,
    chroma: 0.15,
    light: 0.55,
    dark: 0.71,
  },

  {
    key: "custom",
    label: "Personalizada",
    description: "Escolha sua própria cor de destaque",
    premium: false,
    hue: 200,
    chroma: 0.13,
    light: 0.56,
    dark: 0.72,
  },
];

/* =========================================================
   GET THEME COLOR
   ========================================================= */

export function getThemeColor(
  key: ThemeColorKey,
) {
  return (
    THEME_COLORS.find(
      (
        color,
      ) =>
        color.key ===
        key,
    ) ??
    THEME_COLORS[0]
  );
}

export function themeColorSwatch(
  key: ThemeColorKey,
  customHex: string,
) {
  if (key === "custom") {
    return customHex;
  }

  const color = getThemeColor(key);
  return oklch(color.light, color.chroma, color.hue);
}

/* =========================================================
   UTILS
   ========================================================= */

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

/* =========================================================
   HEX → RGB
   ========================================================= */

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

/* =========================================================
   HEX → OKLCH APPROXIMATION
   ========================================================= */

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
   BUILD CSS VARIABLES
   ========================================================= */

export function buildThemeColorVars(
  key: ThemeColorKey,
  mode: ThemeMode,
  customHex: string,
  themeStyle?: ThemeStyle,
): Record<string, string> | null {
  /*
   * O tema classic usa as variáveis
   * padrão definidas no styles.css.
   */

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

  /*
   * Cor personalizada.
   */

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

  /*
   * Variante visual.
   */

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