import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import type { Attempt } from "../lib/types";

type ProgressState = {
  seenIds: string[];
  lastSeenAt: Record<string, number>;
  attempts: Attempt[];
  markSeen: (ids: string[]) => void;
  addAttempt: (attempt: Attempt) => void;
  resetTrainingHistory: () => void;
};

function createProgressStore(persistName: string): UseBoundStore<StoreApi<ProgressState>> {
  return create<ProgressState>()(
    persist(
      (set) => ({
        seenIds: [],
        lastSeenAt: {},
        attempts: [],

        markSeen(ids) {
          set((state) => {
            const now = Date.now();
            const seen = new Set(state.seenIds);
            const lastSeenAt = { ...state.lastSeenAt };
            for (const id of ids) {
              seen.add(id);
              lastSeenAt[id] = now;
            }
            return { seenIds: [...seen], lastSeenAt };
          });
        },

        addAttempt(attempt) {
          set((state) => ({ attempts: [...state.attempts, attempt] }));
        },

        resetTrainingHistory() {
          set({ seenIds: [], lastSeenAt: {}, attempts: [] });
        },
      }),
      { name: persistName },
    ),
  );
}

export const useDouanesProgressStore = createProgressStore("douanes-progress");
export const useTresorProgressStore = createProgressStore("tresor-progress");
