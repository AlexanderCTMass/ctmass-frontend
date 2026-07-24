import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({ id: "ctmass.app" });

export const persistedStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};
