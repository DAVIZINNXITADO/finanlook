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
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext =
  createContext<
    ThemeProviderState | undefined
  >(undefined);

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "finanlook-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] =
    useState<Theme>(() => {
      const savedTheme =
        localStorage.getItem(
          storageKey,
        ) as Theme | null;

      if (
        savedTheme === "light" ||
        savedTheme === "dark" ||
        savedTheme === "system"
      ) {
        return savedTheme;
      }

      return defaultTheme;
    });

  useEffect(() => {
    const root =
      window.document.documentElement;

    function applyTheme(
      selectedTheme: Theme,
    ) {
      root.classList.remove(
        "light",
        "dark",
      );

      const resolvedTheme =
        selectedTheme === "system"
          ? getSystemTheme()
          : selectedTheme;

      root.classList.add(
        resolvedTheme,
      );
    }

    applyTheme(theme);

    if (theme !== "system") {
      return;
    }

    const mediaQuery =
      window.matchMedia(
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

  function setTheme(
    newTheme: Theme,
  ) {
    localStorage.setItem(
      storageKey,
      newTheme,
    );

    setThemeState(newTheme);
  }

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

export function useTheme() {
  const context =
    useContext(
      ThemeProviderContext,
    );

  if (context === undefined) {
    throw new Error(
      "useTheme must be used inside ThemeProvider.",
    );
  }

  return context;
}