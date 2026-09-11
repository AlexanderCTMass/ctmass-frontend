import {
  type ImageStyle,
  Platform,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import {
  type ColorScheme,
  resolveScheme,
  useThemeStore,
} from "@/store/use-theme-store";

export const Brand = {
  primary: "#16B364",
  primaryDark: "#087443",
  primaryLight: "#3FC79A",
  coin: "#FFC107",
  coinDark: "#FF8F00",
  info: "#2970FF",
  danger: "#F04438",
} as const;

export type { ColorScheme };

export type ThemeColors = {
  background: string;
  splash: string;
  backgroundElevated: string;
  surface: string;
  surfaceStrong: string;
  border: string;
  borderStrong: string;
  text: string;
  textStrong: string;
  textSecondary: string;
  textMuted: string;
  overlay: string;
  scrim: string;
  skeleton: string;
  track: string;
  switchTrack: string;
  accent: string;
  onAccent: string;
  coin: string;
  info: string;
  danger: string;
  dangerText: string;
  destructive: string;
  destructiveMuted: string;
};

type GradientStops = readonly [string, string, ...string[]];

export type ThemeGradients = {
  screen: GradientStops;
  primary: GradientStops;
  coin: GradientStops;
  shop: GradientStops;
  card: GradientStops;
  disabled: GradientStops;
};

export type Theme = {
  scheme: ColorScheme;
  isDark: boolean;
  colors: ThemeColors;
  gradients: ThemeGradients;
};

const brandGradients = {
  primary: [Brand.primaryLight, Brand.primaryDark],
  coin: [Brand.coin, Brand.coinDark],
  shop: ["#1A237E", "#283593", "#1565C0"],
} as const;

const darkTheme: Theme = {
  scheme: "dark",
  isDark: true,
  colors: {
    background: "#05070C",
    splash: "#05070C",
    backgroundElevated: "#0C1420",
    surface: "rgba(255,255,255,0.05)",
    surfaceStrong: "rgba(255,255,255,0.09)",
    border: "rgba(255,255,255,0.10)",
    borderStrong: "rgba(255,255,255,0.18)",
    text: "#F6F9FC",
    textStrong: "#FFFFFF",
    textSecondary: "#9AA7B8",
    textMuted: "#66738A",
    overlay: "rgba(5,7,12,0.72)",
    scrim: "rgba(5,7,12,0.55)",
    skeleton: "rgba(255,255,255,0.08)",
    track: "rgba(3,7,12,0.55)",
    switchTrack: "rgba(255,255,255,0.10)",
    accent: Brand.primaryLight,
    onAccent: "#04170D",
    coin: Brand.coin,
    info: Brand.info,
    danger: Brand.danger,
    dangerText: "#FCA5A5",
    destructive: "#F87171",
    destructiveMuted: "rgba(248,113,113,0.75)",
  },
  gradients: {
    ...brandGradients,
    screen: ["#0A1A12", "#091710", "#05080D"],
    card: ["rgba(255,255,255,0.09)", "rgba(255,255,255,0.02)"],
    disabled: ["rgba(255,255,255,0.09)", "rgba(255,255,255,0.045)"],
  },
};

const lightTheme: Theme = {
  scheme: "light",
  isDark: false,
  colors: {
    background: "#F2F7F4",
    splash: "#EAF5EE",
    backgroundElevated: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceStrong: "#E6EFEA",
    border: "rgba(10,46,28,0.12)",
    borderStrong: "rgba(10,46,28,0.22)",
    text: "#0B1F14",
    textStrong: "#04130B",
    textSecondary: "#3F5448",
    textMuted: "#5E7166",
    overlay: "rgba(8,24,16,0.45)",
    scrim: "rgba(255,255,255,0.86)",
    skeleton: "rgba(10,46,28,0.08)",
    track: "rgba(10,46,28,0.08)",
    switchTrack: "rgba(10,46,28,0.24)",
    accent: Brand.primaryDark,
    onAccent: "#04170D",
    coin: "#B54708",
    info: "#155EEF",
    danger: "#D92D20",
    dangerText: "#B42318",
    destructive: "#D92D20",
    destructiveMuted: "rgba(217,45,32,0.75)",
  },
  gradients: {
    ...brandGradients,
    screen: ["#DDF1E5", "#EAF5EE", "#F5F9F6"],
    card: ["#FFFFFF", "#F4F9F6"],
    disabled: ["#E3EAE6", "#D8E1DC"],
  },
};

export const Themes: Record<ColorScheme, Theme> = {
  dark: darkTheme,
  light: lightTheme,
};

export function useTheme(): Theme {
  const scheme = useThemeStore(resolveScheme);
  return scheme === "light" ? lightTheme : darkTheme;
}

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function makeStyles<T extends NamedStyles<T>>(
  factory: (theme: Theme) => T,
): () => T {
  const sheets: Record<ColorScheme, T> = {
    dark: StyleSheet.create(factory(darkTheme)),
    light: StyleSheet.create(factory(lightTheme)),
  };
  return function useStyles() {
    return sheets[useTheme().scheme];
  };
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    rounded: "normal",
    mono: "monospace",
  },
});

export const Duration = {
  fast: 220,
  base: 420,
  slow: 700,
  ambient: 6000,
} as const;
