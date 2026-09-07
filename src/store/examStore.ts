import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import type { Question } from "../lib/types";

type ExamStatus = "idle" | "running";

type ExamState = {
  status: ExamStatus;
  questions: Question[];
  answers: Record<string, string[]>;
  flagged: string[];
  currentIndex: number;
  startedAt: number | null;
  paused: boolean;
  pauseStartedAt: number | null;
  totalPausedMs: number;

  startExam: (questions: Question[]) => void;
  toggleOption: (questionId: string, optionId: string) => void;
  goTo: (index: number) => void;
  toggleFlag: (questionId: string) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
};

const initialSession = {
  status: "idle" as ExamStatus,
  questions: [] as Question[],
  answers: {} as Record<string, string[]>,
  flagged: [] as string[],
  currentIndex: 0,
  startedAt: null as number | null,
  paused: false,
  pauseStartedAt: null as number | null,
  totalPausedMs: 0,
};

function createExamStore(persistName: string): UseBoundStore<StoreApi<ExamState>> {
  return create<ExamState>()(
    persist(
      (set) => ({
        ...initialSession,

        startExam(questions) {
          set({
            ...initialSession,
            status: "running",
            questions,
            startedAt: Date.now(),
          });
        },

        toggleOption(questionId, optionId) {
          set((state) => {
            const current = state.answers[questionId] ?? [];
            const next = current.includes(optionId)
              ? current.filter((id) => id !== optionId)
              : [...current, optionId];
            return { answers: { ...state.answers, [questionId]: next } };
          });
        },

        goTo(index) {
          set((state) => ({
            currentIndex: Math.max(0, Math.min(index, state.questions.length - 1)),
          }));
        },

        toggleFlag(questionId) {
          set((state) => ({
            flagged: state.flagged.includes(questionId)
              ? state.flagged.filter((id) => id !== questionId)
              : [...state.flagged, questionId],
          }));
        },

        pause() {
          set((state) => (state.paused ? state : { paused: true, pauseStartedAt: Date.now() }));
        },

        resume() {
          set((state) => {
            if (!state.paused || state.pauseStartedAt === null) return state;
            return {
              paused: false,
              pauseStartedAt: null,
              totalPausedMs: state.totalPausedMs + (Date.now() - state.pauseStartedAt),
            };
          });
        },

        reset() {
          set({ ...initialSession });
        },
      }),
      { name: persistName },
    ),
  );
}

export const useDouanesExamStore = createExamStore("douanes-exam");
export const useTresorExamStore = createExamStore("tresor-exam");

/** Active (non-paused) elapsed seconds since the exam started, derived from wall-clock time. */
export function getElapsedSeconds(state: ExamState, now: number = Date.now()): number {
  if (state.startedAt === null) return 0;
  const currentPauseMs = state.paused && state.pauseStartedAt !== null ? now - state.pauseStartedAt : 0;
  const elapsedMs = now - state.startedAt - state.totalPausedMs - currentPauseMs;
  return Math.max(0, Math.floor(elapsedMs / 1000));
}

export function getRemainingSeconds(
  state: ExamState,
  durationSeconds: number,
  now: number = Date.now(),
): number {
  return Math.max(0, durationSeconds - getElapsedSeconds(state, now));
}

export function getPausedSeconds(state: ExamState, now: number = Date.now()): number {
  const currentPauseMs = state.paused && state.pauseStartedAt !== null ? now - state.pauseStartedAt : 0;
  return Math.floor((state.totalPausedMs + currentPauseMs) / 1000);
}
