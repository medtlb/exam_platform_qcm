export type Track = "douanes" | "tresor";

/**
 * Section keys are free-form per track (see `trackConfig.ts`) — a douanes
 * "general" and a tresor "accounting-execution" share nothing but the type.
 */
export type Section = string;

export type QuestionOption = {
  id: string;
  text: string;
};

export type Question = {
  id: string; // "gc-0001" | "ar-0001" | "fr-0001" | "tr-ae-0001" ...
  track: Track;
  section: Section;
  topic: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  lang: "ar" | "fr";
  prompt: string;
  options: QuestionOption[]; // 5 to 7 options, minimum 5
  correct: string[]; // 1..n option ids, n < options.length
  explanation: string;
  source?: string;
};

export type AttemptQuestion = {
  question: Question; // full snapshot, so a past attempt is self-contained
  selected: string[];
  raw: number;
  floored: number;
};

export type SectionScore = { score: number; max: number };

export type Attempt = {
  id: string;
  track: Track;
  candidateName: string;
  date: string; // ISO timestamp when submitted
  timeUsedSeconds: number;
  pausedSeconds: number;
  total: number; // sum of floored scores, out of questions.length
  mark20: number;
  bySection: Record<Section, SectionScore>;
  // Only populated for a track whose config marks one section as a level
  // test (the douanes track's French subset). Absent for other tracks.
  byFrenchDifficulty?: Record<1 | 2 | 3 | 4 | 5, SectionScore>;
  unanswered: number;
  questions: AttemptQuestion[]; // in exam order
};

/**
 * Lesson content — the study side of the app. Text carries light inline markup
 * (`**bold**`, `*italic*`); see `InlineText` in the lessons feature.
 */
export type LessonEntry = {
  term?: string;
  text?: string;
  items?: LessonEntry[];
  ordered?: boolean;
};

export type LessonBlock =
  | { kind: "note"; text: string }
  | { kind: "list"; ordered: boolean; items: LessonEntry[] }
  | { kind: "table"; head: string[]; rows: string[][] };

export type Lesson = {
  id: string; // "m1-l1"
  moduleId: string;
  order: number;
  title: string;
  lang: "ar" | "fr";
  topics: string[]; // topic keys from bankTargets — what this lesson prepares
  points: number; // memorisable points, shown on the lesson card
  blocks: LessonBlock[];
};

export type LessonModule = {
  id: string; // "m1"
  order: number;
  title: string;
  titleFr: string;
  subtitle: string;
  section: Section;
  lang: "ar" | "fr";
  lessons: Lesson[];
};
