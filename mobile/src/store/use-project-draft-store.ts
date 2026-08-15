import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { persistedStorage } from "@/lib/storage";

type ProjectDraftState = {
  specialty: string | null;
  name: string | null;
  location: string | null;
  photoUri: string | null;
  requestId: string | null;
  createdProjectId: string | null;
  setSpecialty: (specialty: string) => void;
  setName: (name: string) => void;
  setLocation: (location: string) => void;
  setPhotoUri: (photoUri: string | null) => void;
  setCreatedProjectId: (id: string) => void;
  ensureRequestId: () => string;
  reset: () => void;
};

function generateRequestId(): string {
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `CT-${digits}`;
}

export const useProjectDraftStore = create<ProjectDraftState>()(
  persist(
    (set, get) => ({
      specialty: null,
      name: null,
      location: null,
      photoUri: null,
      requestId: null,
      createdProjectId: null,
      setSpecialty: (specialty) => set({ specialty }),
      setName: (name) => set({ name }),
      setLocation: (location) => set({ location }),
      setPhotoUri: (photoUri) => set({ photoUri }),
      setCreatedProjectId: (id) => set({ createdProjectId: id }),
      ensureRequestId: () => {
        const existing = get().requestId;
        if (existing) return existing;
        const next = generateRequestId();
        set({ requestId: next });
        return next;
      },
      reset: () =>
        set({
          specialty: null,
          name: null,
          location: null,
          photoUri: null,
          requestId: null,
          createdProjectId: null,
        }),
    }),
    {
      name: "ctmass.project-draft",
      storage: createJSONStorage(() => persistedStorage),
    },
  ),
);
