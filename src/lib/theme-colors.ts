/**
 * Sistema de aparência e cores do FinanLook.
 *
 * O modo (light, dark ou system) é controlado
 * pelo ThemeProvider.
 *
 * Este arquivo controla:
 * - estilo da interface
 * - cores de destaque
 * - conversão HEX → OKLCH
 * - variáveis CSS
 */

/* =========================================================
   TIPOS
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

export type ThemeMode =
  | "light"
  | "dark";

export type InterfaceStyleKey =
  | "neutral"
  | "emerald";

export type ThemeColor = {
  key: ThemeColorKey;
  label: string;
  description: string;
  premium: boolean;
  hue: number;
  chroma: number;

  lightness: {
    light: number;
    dark: number;
  };
};

export type InterfaceStyle = {
  key: InterfaceStyleKey;
  label: string;
  description: string;
};

/* =========================================================
   ESTILOS DA INTERFACE
   ========================================================= */

export const INTERFACE_STYLES: InterfaceStyle[] = [
  {
    key: "neutral",
    label: "Neutro",
    description:
      "Preto, branco e tons de cinza sem tonalidade esverdeada",
  },

  {
    key: "emerald",
    label: "Esverdeado",
    description:
      "Visual original do FinanLook com tons suaves de verde",
  },
];

export const DEFAULT_INTERFACE_STYLE: InterfaceStyleKey =
  "emerald";

export function getInterfaceStyle(
  key: InterfaceStyleKey,
): InterfaceStyle {
  return (
    INTERFACE_STYLES.find(
      (item) =>
        item.key === key,
    ) ??
    INTERFACE_STYLES[0]
  );
}

/* =========================================================
   CORES DE DESTAQUE
   ========================================================= */

export const THEME_COLORS: ThemeColor[] = [
  {
    key: "classic",
    label: "Clássico",
    description:
      "Cor original do FinanLook",
    premium: false,
    hue: 162,
    chroma: 0.13,
    lightness: {
      light: 0.56,
      dark: 0.72,
    },
  },

  {
    key: "gold",
    label: "Dourado",
    description:
      "Sofisticado e discreto",
    premium: true,
    hue: 85,
    chroma: 0.11,
    lightness: {
      light: 0.62,
      dark: 0.78,
    },
  },

  {
    key: "red",
    label: "Vermelho",
    description:
      "Forte e marcante",
    premium: true,
    hue: 25,
    chroma: 0.17,
    lightness: {
      light: 0.55,
      dark: 0.67,
    },
  },

  {
    key: "blue",
    label: "Azul",
    description:
      "Clássico e profissional",
    premium: true,
    hue: 250,
    chroma: 0.14,
    lightness: {
      light: 0.55,
      dark: 0.7,
    },
  },

  {
    key: "yellow",
    label: "Amarelo",
    description:
      "Claro e energético",
    premium: true,
    hue: 95,
    chroma: 0.14,
    lightness: {
      light: 0.72,
      dark: 0.84,
    },
  },

  {
    key: "green",
    label: "Verde",
    description:
      "Natural e equilibrado",
    premium: true,
    hue: 145,
    chroma: 0.15,
    lightness: {
      light: 0.58,
      dark: 0.73,
    },
  },

  {
    key: "purple",
    label: "Roxo",
    description:
      "Moderno e criativo",
    premium: true,
    hue: 300,
    chroma: 0.15,
    lightness: {
      light: 0.55,
      dark: 0.71,
    },
  },

  {
    key: "custom",
    label: "Cor personalizada",
    description:
      "Escolha qualquer cor",
    premium: true,
    hue: 200,
    chroma: 0.13,
    lightness: {
      light: 0.56,
      dark: 0.72,
    },
  },
];

/* =========================================================
   VALORES PADRÃO
   ========================================================= */

export const DEFAULT_THEME_COLOR: ThemeColorKey =
  "classic";

export const DEFAULT_CUSTOM_COLOR =
  "#2f6df6";

/* =========================================================
   HELPERS
   ========================================================= */

export function getThemeColor(
  key: ThemeColorKey,
): ThemeColor {
  return (
    THEME_COLORS.find(
      (item) =>
        item.key === key,
    ) ??
    THEME_COLORS[0]
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
  return `oklch(${lightness.toFixed(
    3,
  )} ${chroma.toFixed(
    3,
  )} ${hue.toFixed(
    1,
  )})`;
}

/* =========================================================
   CONVERSÃO SRGB → LINEAR
   ========================================================= */

function srgbToLinear(
  value: number,
) {
  return value <= 0.04045
    ? value / 12.92
    : Math.pow(
        (value + 0.055) /
          1.055,
        2.4,
      );
}

/* =========================================================
   CONVERSÃO HEX → OKLCH
   ========================================================= */

export function hexToOklch(
  hex: string,
) {
  const clean =
    hex
      .replace(
        "#",
        "",
      )
      .trim();

  const full =
    clean.length === 3
      ? clean
          .split("")
          .map(
            (char) =>
              char + char,
          )
          .join("")
      : clean;

  const valid =
    /^[0-9a-fA-F]{6}$/.test(
      full,
    );

  if (!valid) {
    return {
      lightness: 0.56,
      chroma: 0.13,
      hue: 200,
    };
  }

  const r =
    srgbToLinear(
      parseInt(
        full.slice(
          0,
          2,
        ),
        16,
      ) / 255,
    );

  const g =
    srgbToLinear(
      parseInt(
        full.slice(
          2,
          4,
        ),
        16,
      ) / 255,
    );

  const b =
    srgbToLinear(
      parseInt(
        full.slice(
          4,
          6,
        ),
        16,
      ) / 255,
    );

  const l =
    Math.cbrt(
      0.4122214708 * r +
        0.5363325363 * g +
        0.0514459929 * b,
    );

  const m =
    Math.cbrt(
      0.2119034982 * r +
        0.6806995451 * g +
        0.1073969566 * b,
    );

  const s =
    Math.cbrt(
      0.0883024619 * r +
        0.2817188376 * g +
        0.6299787005 * b,
    );

  const lightness =
    0.2104542553 * l +
    0.793617785 * m -
    0.0040720468 * s;

  const a =
    1.9779984951 * l -
    2.428592205 * m +
    0.4505937099 * s;

  const bValue =
    0.0259040371 * l +
    0.7827717662 * m -
    0.808675766 * s;

  const chroma =
    Math.sqrt(
      a * a +
        bValue * bValue,
    );

  const hue =
    ((Math.atan2(
      bValue,
      a,
    ) *
      180) /
      Math.PI +
      360) %
    360;

  return {
    lightness,
    chroma,
    hue,
  };
}

/* =========================================================
   VARIÁVEIS DA COR DE DESTAQUE
   ========================================================= */

export function buildThemeColorVars(
  key: ThemeColorKey,
  mode: ThemeMode,
  customHex: string,
): Record<string, string> {
  const preset =
    getThemeColor(
      key,
    );

  let hue =
    preset.hue;

  let chroma =
    preset.chroma;

  let lightness =
    preset.lightness[
      mode
    ];

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
      clamp(
        parsed.chroma,
        0.05,
        0.16,
      );

    lightness =
      mode === "dark"
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

  const primary =
    oklch(
      lightness,
      chroma,
      hue,
    );

  const isLightColor =
    lightness >=
    0.68;

  const primaryForeground =
    isLightColor
      ? oklch(
          0.22,
          0.02,
          hue,
        )
      : oklch(
          0.99,
          0,
          0,
        );

  const accent =
    mode === "dark"
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

  const accentForeground =
    mode === "dark"
      ? oklch(
          0.96,
          0,
          0,
        )
      : oklch(
          0.3,
          0.04,
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
      accentForeground,

    "--sidebar-primary":
      primary,

    "--sidebar-primary-foreground":
      primaryForeground,

    "--sidebar-accent":
      accent,

    "--sidebar-accent-foreground":
      accentForeground,

    "--sidebar-ring":
      primary,

    "--chart-1":
      primary,
  };
}

/* =========================================================
   VARIÁVEIS DO ESTILO DA INTERFACE
   ========================================================= */

export function buildInterfaceStyleVars(
  style: InterfaceStyleKey,
  mode: ThemeMode,
): Record<string, string> {

  /* =====================================================
     ESTILO NEUTRO
     ===================================================== */

  if (
    style ===
    "neutral"
  ) {
    if (
      mode ===
      "dark"
    ) {
      return {
        "--background":
          "oklch(0.145 0 0)",

        "--foreground":
          "oklch(0.985 0 0)",

        "--card":
          "oklch(0.190 0 0)",

        "--card-foreground":
          "oklch(0.985 0 0)",

        "--popover":
          "oklch(0.190 0 0)",

        "--popover-foreground":
          "oklch(0.985 0 0)",

        "--secondary":
          "oklch(0.245 0 0)",

        "--secondary-foreground":
          "oklch(0.985 0 0)",

        "--muted":
          "oklch(0.245 0 0)",

        "--muted-foreground":
          "oklch(0.700 0 0)",

        "--border":
          "oklch(0.300 0 0)",

        "--input":
          "oklch(0.300 0 0)",

        "--sidebar-background":
          "oklch(0.165 0 0)",

        "--sidebar-foreground":
          "oklch(0.985 0 0)",

        "--sidebar-border":
          "oklch(0.300 0 0)",
      };
    }

    return {
      "--background":
        "oklch(0.985 0 0)",

      "--foreground":
        "oklch(0.145 0 0)",

      "--card":
        "oklch(1 0 0)",

      "--card-foreground":
        "oklch(0.145 0 0)",

      "--popover":
        "oklch(1 0 0)",

      "--popover-foreground":
        "oklch(0.145 0 0)",

      "--secondary":
        "oklch(0.965 0 0)",

      "--secondary-foreground":
        "oklch(0.205 0 0)",

      "--muted":
        "oklch(0.965 0 0)",

      "--muted-foreground":
        "oklch(0.500 0 0)",

      "--border":
        "oklch(0.900 0 0)",

      "--input":
        "oklch(0.900 0 0)",

      "--sidebar-background":
        "oklch(0.985 0 0)",

      "--sidebar-foreground":
        "oklch(0.145 0 0)",

      "--sidebar-border":
        "oklch(0.900 0 0)",
    };
  }

  /* =====================================================
     ESTILO ESMERALDADO
     ===================================================== */

  if (
    mode ===
    "dark"
  ) {
    return {
      "--background":
        "oklch(0.145 0.012 162)",

      "--foreground":
        "oklch(0.985 0.006 162)",

      "--card":
        "oklch(0.190 0.014 162)",

      "--card-foreground":
        "oklch(0.985 0.006 162)",

      "--popover":
        "oklch(0.190 0.014 162)",

      "--popover-foreground":
        "oklch(0.985 0.006 162)",

      "--secondary":
        "oklch(0.245 0.016 162)",

      "--secondary-foreground":
        "oklch(0.985 0.006 162)",

      "--muted":
        "oklch(0.245 0.016 162)",

      "--muted-foreground":
        "oklch(0.700 0.012 162)",

      "--border":
        "oklch(0.300 0.018 162)",

      "--input":
        "oklch(0.300 0.018 162)",

      "--sidebar-background":
        "oklch(0.165 0.014 162)",

      "--sidebar-foreground":
        "oklch(0.985 0.006 162)",

      "--sidebar-border":
        "oklch(0.300 0.018 162)",
    };
  }

  return {
    "--background":
      "oklch(0.985 0.006 162)",

    "--foreground":
      "oklch(0.145 0.012 162)",

    "--card":
      "oklch(1 0.003 162)",

    "--card-foreground":
      "oklch(0.145 0.012 162)",

    "--popover":
      "oklch(1 0.003 162)",

    "--popover-foreground":
      "oklch(0.145 0.012 162)",

    "--secondary":
      "oklch(0.965 0.010 162)",

    "--secondary-foreground":
      "oklch(0.205 0.015 162)",

    "--muted":
      "oklch(0.965 0.010 162)",

    "--muted-foreground":
      "oklch(0.500 0.015 162)",

    "--border":
      "oklch(0.900 0.012 162)",

    "--input":
      "oklch(0.900 0.012 162)",

    "--sidebar-background":
      "oklch(0.985 0.008 162)",

    "--sidebar-foreground":
      "oklch(0.145 0.012 162)",

    "--sidebar-border":
      "oklch(0.900 0.012 162)",
  };
}

/* =========================================================
   AMOSTRA DE COR
   ========================================================= */

export function themeColorSwatch(
  key: ThemeColorKey,
  customHex: string,
) {
  if (
    key ===
    "custom"
  ) {
    return customHex;
  }

  const preset =
    getThemeColor(
      key,
    );

  return oklch(
    preset.lightness.light,
    preset.chroma,
    preset.hue,
  );
}