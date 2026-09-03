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
  creationClaimed: boolean;
  setSpecialty: (specialty: string) => void;
  setName: (name: string) => void;
  setLocation: (location: string) => void;
  setPhotoUri: (photoUri: string | null) => void;
  setCreatedProjectId: (id: string) => void;
  claimProjectCreation: () => boolean;
  releaseProjectCreation: () => void;
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
      creationClaimed: false,
      setSpecialty: (specialty) => set({ specialty }),
      setName: (name) => set({ name }),
      setLocation: (location) => set({ location }),
      setPhotoUri: (photoUri) => set({ photoUri }),
      setCreatedProjectId: (id) => set({ createdProjectId: id }),
      claimProjectCreation: () => {
        if (get().creationClaimed || get().createdProjectId) return false;
        set({ creationClaimed: true });
        return true;
      },
      releaseProjectCreation: () => set({ creationClaimed: false }),
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
          creationClaimed: false,
        }),
    }),
    {
      name: "ctmass.project-draft",
      storage: createJSONStorage(() => persistedStorage),
      partialize: (state) => ({
        specialty: state.specialty,
        name: state.name,
        location: state.location,
        photoUri: state.photoUri,
        requestId: state.requestId,
        createdProjectId: state.createdProjectId,
      }),
    },
  ),
);
