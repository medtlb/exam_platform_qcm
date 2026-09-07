import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";

type LessonsState = {
  studiedIds: string[];
  lastOpenedId: string | null;
  isStudied: (lessonId: string) => boolean;
  setStudied: (lessonId: string, studied: boolean) => void;
  markOpened: (lessonId: string) => void;
  resetLessonProgress: () => void;
};

function createLessonsStore(persistName: string): UseBoundStore<StoreApi<LessonsState>> {
  return create<LessonsState>()(
    persist(
      (set, get) => ({
        studiedIds: [],
        lastOpenedId: null,

        isStudied(lessonId) {
          return get().studiedIds.includes(lessonId);
        },

        setStudied(lessonId, studied) {
          set((state) => ({
            studiedIds: studied
              ? state.studiedIds.includes(lessonId)
                ? state.studiedIds
                : [...state.studiedIds, lessonId]
              : state.studiedIds.filter((id) => id !== lessonId),
          }));
        },

        markOpened(lessonId) {
          set({ lastOpenedId: lessonId });
        },

        resetLessonProgress() {
          set({ studiedIds: [], lastOpenedId: null });
        },
      }),
      { name: persistName },
    ),
  );
}

export const useDouanesLessonsStore = createLessonsStore("douanes-lessons");
export const useTresorLessonsStore = createLessonsStore("tresor-lessons");
