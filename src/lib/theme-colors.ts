/**
 * Paletas de cor do FinanLook.
 *
 * A cor escolhida vira variáveis CSS (--primary, --ring, --accent...),
 * então todos os componentes continuam usando os tokens semânticos.
 */

export type ThemeColorKey =
  | "classic"
  | "gold"
  | "red"
  | "blue"
  | "yellow"
  | "green"
  | "purple"
  | "custom";

export type ThemeColor = {
  key: ThemeColorKey;
  label: string;
  description: string;
  premium: boolean;
  /* matiz e croma em OKLCH */
  hue: number;
  chroma: number;
  lightness: {
    light: number;
    dark: number;
  };
};

export const THEME_COLORS: ThemeColor[] = [
  {
    key: "classic",
    label: "Clássico",
    description: "Verde-esmeralda original do FinanLook",
    premium: false,
    hue: 162,
    chroma: 0.13,
    lightness: { light: 0.56, dark: 0.72 },
  },
  {
    key: "gold",
    label: "Dourado",
    description: "Sofisticado e discreto",
    premium: true,
    hue: 85,
    chroma: 0.11,
    lightness: { light: 0.62, dark: 0.78 },
  },
  {
    key: "red",
    label: "Vermelho",
    description: "Forte e marcante",
    premium: true,
    hue: 25,
    chroma: 0.17,
    lightness: { light: 0.55, dark: 0.67 },
  },
  {
    key: "blue",
    label: "Azul",
    description: "Clássico dos aplicativos financeiros",
    premium: true,
    hue: 250,
    chroma: 0.14,
    lightness: { light: 0.55, dark: 0.7 },
  },
  {
    key: "yellow",
    label: "Amarelo",
    description: "Claro e energético",
    premium: true,
    hue: 95,
    chroma: 0.14,
    lightness: { light: 0.72, dark: 0.84 },
  },
  {
    key: "green",
    label: "Verde",
    description: "Natural e equilibrado",
    premium: true,
    hue: 145,
    chroma: 0.15,
    lightness: { light: 0.58, dark: 0.73 },
  },
  {
    key: "purple",
    label: "Roxo",
    description: "Moderno e criativo",
    premium: true,
    hue: 300,
    chroma: 0.15,
    lightness: { light: 0.55, dark: 0.71 },
  },
  {
    key: "custom",
    label: "Cor personalizada",
    description: "Escolha qualquer cor com o seletor",
    premium: true,
    hue: 200,
    chroma: 0.13,
    lightness: { light: 0.56, dark: 0.72 },
  },
];

export const DEFAULT_CUSTOM_COLOR = "#2f6df6";

export function getThemeColor(key: ThemeColorKey) {
  return (
    THEME_COLORS.find((item) => item.key === key) ??
    (THEME_COLORS[0] as ThemeColor)
  );
}

/* =========================================================
   CONVERSÃO HEX -> OKLCH
   ========================================================= */

function srgbToLinear(value: number) {
  return value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
}

export function hexToOklch(hex: string) {
  const clean = hex.replace("#", "").trim();

  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;

  const valid = /^[0-9a-fA-F]{6}$/.test(full);

  if (!valid) {
    return { lightness: 0.56, chroma: 0.13, hue: 200 };
  }

  const r = srgbToLinear(parseInt(full.slice(0, 2), 16) / 255);
  const g = srgbToLinear(parseInt(full.slice(2, 4), 16) / 255);
  const b = srgbToLinear(parseInt(full.slice(4, 6), 16) / 255);

  const l = Math.cbrt(
    0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b,
  );

  const m = Math.cbrt(
    0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b,
  );

  const s = Math.cbrt(
    0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b,
  );

  const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const chroma = Math.sqrt(okA * okA + okB * okB);

  const hue = ((Math.atan2(okB, okA) * 180) / Math.PI + 360) % 360;

  return { lightness: okL, chroma, hue };
}

/* =========================================================
   VARIÁVEIS CSS
   ========================================================= */

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function oklch(l: number, c: number, h: number) {
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

/**
 * Monta as variáveis de cor para a paleta escolhida.
 * Retorna `null` para a paleta clássica — nesse caso usamos o CSS padrão.
 */
export function buildThemeColorVars(
  key: ThemeColorKey,
  mode: "light" | "dark",
  customHex: string,
): Record<string, string> | null {
  if (key === "classic") {
    return null;
  }

  const preset = getThemeColor(key);

  let hue = preset.hue;
  let chroma = preset.chroma;
  let lightness = preset.lightness[mode];

  if (key === "custom") {
    const parsed = hexToOklch(customHex);

    hue = parsed.hue;

    /* limitamos a saturação para manter aparência profissional */
    chroma = clamp(parsed.chroma, 0.05, 0.16);

    lightness =
      mode === "dark"
        ? clamp(parsed.lightness, 0.62, 0.84)
        : clamp(parsed.lightness, 0.48, 0.68);
  }

  const primary = oklch(lightness, chroma, hue);

  const onLight = lightness >= 0.68;

  const primaryForeground = onLight
    ? oklch(0.22, 0.03, hue)
    : oklch(0.99, 0.01, hue);

  const accent =
    mode === "dark"
      ? oklch(0.32, Math.min(chroma, 0.06), hue)
      : oklch(0.93, Math.min(chroma, 0.05), hue);

  const accentForeground =
    mode === "dark" ? oklch(0.96, 0.01, hue) : oklch(0.3, 0.06, hue);

  return {
    "--primary": primary,
    "--primary-foreground": primaryForeground,
    "--ring": primary,
    "--accent": accent,
    "--accent-foreground": accentForeground,
    "--sidebar-primary": primary,
    "--sidebar-primary-foreground": primaryForeground,
    "--sidebar-accent": accent,
    "--sidebar-accent-foreground": accentForeground,
    "--sidebar-ring": primary,
    "--chart-1": primary,
  };
}

/** Cor de amostra para as bolinhas de pré-visualização. */
export function themeColorSwatch(
  key: ThemeColorKey,
  customHex: string,
) {
  if (key === "custom") {
    return customHex;
  }

  const preset = getThemeColor(key);

  return oklch(preset.lightness.light, preset.chroma, preset.hue);
}
