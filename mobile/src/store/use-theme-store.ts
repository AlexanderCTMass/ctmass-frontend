import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { persistedStorage } from "@/lib/storage";

export type ColorScheme = "light" | "dark";
export type ThemePreference = "system" | ColorScheme;

type ThemeState = {
  preference: ThemePreference;
  systemScheme: ColorScheme | null;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const SYSTEM_DETECT_TIMEOUT_MS = 300;

function normalizeScheme(value: unknown): ColorScheme {
  return value === "light" ? "light" : "dark";
}

export function resolveScheme(
  state: Pick<ThemeState, "preference" | "systemScheme">,
): ColorScheme {
  if (state.preference === "system") return state.systemScheme ?? "dark";
  return state.preference;
}

function applyScheme(scheme: ColorScheme): void {
  Appearance.setColorScheme(scheme);
}

function detectSystemScheme(): Promise<ColorScheme> {
  return new Promise((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      finish(colorScheme);
    });
    function finish(next?: unknown) {
      if (settled) return;
      settled = true;
      subscription.remove();
      if (timer) clearTimeout(timer);
      resolve(normalizeScheme(next ?? Appearance.getColorScheme()));
    }
    Appearance.setColorScheme("unspecified");
    timer = setTimeout(() => finish(), SYSTEM_DETECT_TIMEOUT_MS);
  });
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: "system",
      systemScheme: null,
      setPreference: async (preference) => {
        if (preference === "system") {
          const detected = await detectSystemScheme();
          set({ preference, systemScheme: detected });
        } else {
          set({ preference });
        }
        applyScheme(resolveScheme(get()));
      },
    }),
    {
      name: "ctmass.theme",
      storage: createJSONStorage(() => persistedStorage),
      partialize: (state) => ({
        preference: state.preference,
        systemScheme: state.systemScheme,
      }),
    },
  ),
);

export function initializeTheme(): {
  firstLaunch: boolean;
  scheme: ColorScheme;
  preference: ThemePreference;
} {
  const firstLaunch = useThemeStore.getState().systemScheme === null;
  if (firstLaunch) {
    useThemeStore.setState({
      systemScheme: normalizeScheme(Appearance.getColorScheme()),
    });
  }
  const state = useThemeStore.getState();
  const scheme = resolveScheme(state);
  applyScheme(scheme);
  return { firstLaunch, scheme, preference: state.preference };
}
