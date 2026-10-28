import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import i18n, {
  type AppLanguage,
  detectDeviceLanguage,
  initI18n,
} from "@/lib/i18n";
import { persistedStorage } from "@/lib/storage";

type LanguageState = {
  language: AppLanguage | null;
  deviceLanguageAtChoice: AppLanguage | null;
  setLanguage: (language: AppLanguage) => Promise<void>;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: null,
      deviceLanguageAtChoice: null,
      setLanguage: async (language) => {
        set({ language, deviceLanguageAtChoice: detectDeviceLanguage() });
        await i18n.changeLanguage(language);
      },
    }),
    {
      name: "ctmass.language",
      storage: createJSONStorage(() => persistedStorage),
      partialize: (state) => ({
        language: state.language,
        deviceLanguageAtChoice: state.deviceLanguageAtChoice,
      }),
    },
  ),
);

export function initializeLanguage(): {
  language: AppLanguage;
  source: "device" | "manual";
} {
  const device = detectDeviceLanguage();
  const { language, deviceLanguageAtChoice } = useLanguageStore.getState();
  const manualStillValid =
    language !== null && deviceLanguageAtChoice === device;
  if (!manualStillValid && language !== null) {
    useLanguageStore.setState({ language: null, deviceLanguageAtChoice: null });
  }
  const resolved = manualStillValid ? language : device;
  initI18n(resolved);
  return { language: resolved, source: manualStillValid ? "manual" : "device" };
}
