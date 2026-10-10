import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  ContactPreferences,
  StartOption,
} from "@/constants/project-request";
import type { GeoPlace } from "@/lib/mapbox";
import { persistedStorage } from "@/lib/storage";

type ProjectDraftState = {
  specialty: string | null;
  name: string | null;
  location: GeoPlace | null;
  startOptionKey: StartOption["key"] | null;
  budget: number | null;
  contactPreferences: ContactPreferences | null;
  contactPhone: string | null;
  photoUri: string | null;
  requestId: string | null;
  createdProjectId: string | null;
  creationClaimed: boolean;
  targetSpecialistId: string | null;
  targetSpecialistName: string | null;
  setSpecialty: (specialty: string) => void;
  setName: (name: string) => void;
  setLocation: (location: GeoPlace) => void;
  setStartOptionKey: (key: StartOption["key"]) => void;
  setBudget: (budget: number | null) => void;
  setContact: (preferences: ContactPreferences, phone: string | null) => void;
  setPhotoUri: (photoUri: string | null) => void;
  setCreatedProjectId: (id: string) => void;
  setTargetSpecialist: (id: string, name: string) => void;
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
      startOptionKey: null,
      budget: null,
      contactPreferences: null,
      contactPhone: null,
      photoUri: null,
      requestId: null,
      createdProjectId: null,
      creationClaimed: false,
      targetSpecialistId: null,
      targetSpecialistName: null,
      setSpecialty: (specialty) => set({ specialty }),
      setName: (name) => set({ name }),
      setLocation: (location) => set({ location }),
      setStartOptionKey: (startOptionKey) => set({ startOptionKey }),
      setBudget: (budget) => set({ budget }),
      setContact: (contactPreferences, contactPhone) =>
        set({ contactPreferences, contactPhone }),
      setPhotoUri: (photoUri) => set({ photoUri }),
      setCreatedProjectId: (id) => set({ createdProjectId: id }),
      setTargetSpecialist: (id, name) =>
        set({ targetSpecialistId: id, targetSpecialistName: name }),
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
          startOptionKey: null,
          budget: null,
          contactPreferences: null,
          contactPhone: null,
          photoUri: null,
          requestId: null,
          createdProjectId: null,
          creationClaimed: false,
          targetSpecialistId: null,
          targetSpecialistName: null,
        }),
    }),
    {
      name: "ctmass.project-draft",
      version: 1,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Record<string, unknown>;
        if (typeof state.location === "string") state.location = null;
        return state;
      },
      storage: createJSONStorage(() => persistedStorage),
      partialize: (state) => ({
        specialty: state.specialty,
        name: state.name,
        location: state.location,
        startOptionKey: state.startOptionKey,
        budget: state.budget,
        contactPreferences: state.contactPreferences,
        contactPhone: state.contactPhone,
        photoUri: state.photoUri,
        requestId: state.requestId,
        createdProjectId: state.createdProjectId,
        targetSpecialistId: state.targetSpecialistId,
        targetSpecialistName: state.targetSpecialistName,
      }),
    },
  ),
);
