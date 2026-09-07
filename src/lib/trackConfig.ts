import { DEFAULT_COMPOSITION, SESSION_SIZE as DOUANES_SESSION_SIZE } from "./selection";
import { TRESOR_SECTION_LABELS, TRESOR_SESSION_COMPOSITION } from "./bankTargets";
import { useDouanesExamStore, useTresorExamStore } from "../store/examStore";
import { useDouanesLessonsStore, useTresorLessonsStore } from "../store/lessonsStore";
import { useDouanesProgressStore, useTresorProgressStore } from "../store/progressStore";
import type { Section, Track } from "./types";

export type TrackConfig = {
  id: Track;
  routeSegment: string;
  homeTitle: string;
  sessionSize: number;
  timerSeconds: number;
  composition: Record<Section, number>;
  sectionOrder: Section[];
  sectionLabels: Record<Section, string>;
  sectionLabelsShort: Record<Section, string>;
  ascendingDifficultySections: Section[];
  /** Section that gets a per-difficulty breakdown table on the results screen. */
  difficultyBreakdownSection?: Section;
  difficultyBreakdownLabel?: string;
  emblemSrc: string;
  filenamePrefix: string;
  storagePrefix: string;
  hasLessons: boolean;
  /**
   * Sections the candidate may drill in isolation as a side exam (still
   * `sessionSize` questions, but all drawn from one section instead of the
   * normal mixed composition). Omit/leave empty to hide the feature — only
   * the Douanes track offers it today.
   */
  sideExamSections?: Section[];
};

const DOUANES_SECTION_LABELS: Record<Section, string> = {
  general: "الثقافة العامة",
  arabic: "اللغة العربية",
  french: "اللغة الفرنسية",
};

export const trackConfigs: Record<Track, TrackConfig> = {
  douanes: {
    id: "douanes",
    routeSegment: "douanes",
    homeTitle: "منصة تدريب على مسابقة مفتشي الجمارك",
    sessionSize: DOUANES_SESSION_SIZE,
    timerSeconds: 120 * 60,
    composition: DEFAULT_COMPOSITION,
    sectionOrder: ["general", "arabic", "french"],
    sectionLabels: DOUANES_SECTION_LABELS,
    sectionLabelsShort: {
      general: "ثقافة عامة",
      arabic: "لغة عربية",
      french: "لغة فرنسية",
    },
    ascendingDifficultySections: ["french"],
    difficultyBreakdownSection: "french",
    difficultyBreakdownLabel: "التوزيع حسب الصعوبة (اللغة الفرنسية)",
    emblemSrc: "/emblem.png",
    filenamePrefix: "douanes",
    storagePrefix: "douanes",
    hasLessons: true,
    sideExamSections: ["general", "arabic", "french"],
  },
  tresor: {
    id: "tresor",
    routeSegment: "tresor",
    homeTitle: "منصة تدريب على مسابقة مفتش خزينة رئيس",
    sessionSize: 60,
    timerSeconds: 90 * 60,
    composition: TRESOR_SESSION_COMPOSITION,
    sectionOrder: [
      "accounting-execution",
      "public-finance-budget",
      "treasury-accountant",
      "control-audit",
      "economics-policy",
      "tax-debt",
      "law-governance",
    ],
    sectionLabels: TRESOR_SECTION_LABELS,
    sectionLabelsShort: TRESOR_SECTION_LABELS,
    ascendingDifficultySections: [],
    emblemSrc: "/seal-tresor.jpg",
    filenamePrefix: "tresor",
    storagePrefix: "tresor",
    hasLessons: true,
  },
};

export function getTrackConfig(track: string | undefined): TrackConfig | undefined {
  if (track === "douanes" || track === "tresor") return trackConfigs[track];
  return undefined;
}

const examStoreByTrack = {
  douanes: useDouanesExamStore,
  tresor: useTresorExamStore,
} as const;

const progressStoreByTrack = {
  douanes: useDouanesProgressStore,
  tresor: useTresorProgressStore,
} as const;

const lessonsStoreByTrack = {
  douanes: useDouanesLessonsStore,
  tresor: useTresorLessonsStore,
} as const;

/**
 * Picks the right zustand hook for a track. Callers must remount (key on
 * `track`) whenever the resolved track changes — see `TrackRoute` — so the
 * same hook is called on every render of a given component instance.
 */
export function getExamStore(track: Track) {
  return examStoreByTrack[track];
}

export function getProgressStore(track: Track) {
  return progressStoreByTrack[track];
}

export function getLessonsStore(track: Track) {
  return lessonsStoreByTrack[track];
}
