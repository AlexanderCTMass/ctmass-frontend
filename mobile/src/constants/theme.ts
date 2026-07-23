import { Platform } from "react-native";

export const Brand = {
  primary: "#16B364",
  primaryDark: "#087443",
  primaryLight: "#3FC79A",
  coin: "#FFC107",
  coinDark: "#FF8F00",
  info: "#2970FF",
  danger: "#F04438",
} as const;

export const Colors = {
  background: "#05070C",
  backgroundElevated: "#0C1420",
  surface: "rgba(255,255,255,0.05)",
  surfaceStrong: "rgba(255,255,255,0.09)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  text: "#F6F9FC",
  textSecondary: "#9AA7B8",
  textMuted: "#66738A",
  overlay: "rgba(5,7,12,0.72)",
} as const;

export const Gradients = {
  screen: ["#0A1A12", "#091710", "#05080D"] as const,
  primary: [Brand.primaryLight, Brand.primaryDark] as const,
  coin: [Brand.coin, Brand.coinDark] as const,
  shop: ["#1A237E", "#283593", "#1565C0"] as const,
  card: ["rgba(255,255,255,0.09)", "rgba(255,255,255,0.02)"] as const,
};

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
