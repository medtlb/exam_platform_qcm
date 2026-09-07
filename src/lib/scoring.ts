import type { Attempt, AttemptQuestion, Question, SectionScore, Track } from "./types";

/**
 * One question: C correct options, W wrong options.
 * Each correct tick earns 1/C, each wrong tick costs 1/W (0 if W is 0).
 * A question can never score below 0.
 */
export function scoreQuestion(q: Question, selected: string[]): number {
  const correct = new Set(q.correct);
  const C = q.correct.length;
  const W = q.options.length - C;
  let raw = 0;
  for (const id of selected) {
    raw += correct.has(id) ? 1 / C : W > 0 ? -1 / W : 0;
  }
  return Math.max(0, raw);
}

export type QuestionScoreDetail = {
  raw: number; // pre-floor, can be negative
  floored: number; // max(0, raw) — what counts toward the total
};

export function scoreQuestionDetailed(q: Question, selected: string[]): QuestionScoreDetail {
  const correct = new Set(q.correct);
  const C = q.correct.length;
  const W = q.options.length - C;
  let raw = 0;
  for (const id of selected) {
    raw += correct.has(id) ? 1 / C : W > 0 ? -1 / W : 0;
  }
  return { raw, floored: Math.max(0, raw) };
}

export type ExamScore = {
  total: number; // sum of floored per-question scores, out of questions.length
  mark20: number; // total / questions.length * 20, rounded to 2 decimals
};

export function scoreExam(
  questions: Question[],
  answers: Record<string, string[]>,
): ExamScore {
  const total = questions.reduce(
    (sum, q) => sum + scoreQuestion(q, answers[q.id] ?? []),
    0,
  );
  const mark20 = Math.round((total / questions.length) * 20 * 100) / 100;
  return { total, mark20 };
}

function emptySectionScore(): SectionScore {
  return { score: 0, max: 0 };
}

export type BuildAttemptInput = {
  id: string;
  track: Track;
  candidateName: string;
  date: string;
  timeUsedSeconds: number;
  pausedSeconds: number;
  questions: Question[];
  answers: Record<string, string[]>;
  /** Section that gets a per-difficulty breakdown (douanes: "french"). Omit for tracks without one. */
  difficultyBreakdownSection?: string;
};

/** Assembles a full, self-contained Attempt snapshot (§9/§10) from a finished session. */
export function buildAttempt(input: BuildAttemptInput): Attempt {
  const bySection: Record<string, SectionScore> = {};
  const byFrenchDifficulty: Record<1 | 2 | 3 | 4 | 5, SectionScore> = {
    1: emptySectionScore(),
    2: emptySectionScore(),
    3: emptySectionScore(),
    4: emptySectionScore(),
    5: emptySectionScore(),
  };

  let unanswered = 0;
  const attemptQuestions: AttemptQuestion[] = input.questions.map((question) => {
    const selected = input.answers[question.id] ?? [];
    if (selected.length === 0) unanswered++;

    const { raw, floored } = scoreQuestionDetailed(question, selected);

    bySection[question.section] ??= emptySectionScore();
    bySection[question.section].score += floored;
    bySection[question.section].max += 1;

    if (input.difficultyBreakdownSection && question.section === input.difficultyBreakdownSection) {
      byFrenchDifficulty[question.difficulty].score += floored;
      byFrenchDifficulty[question.difficulty].max += 1;
    }

    return { question, selected, raw, floored };
  });

  const total = attemptQuestions.reduce((sum, q) => sum + q.floored, 0);
  const mark20 = Math.round((total / input.questions.length) * 20 * 100) / 100;

  return {
    id: input.id,
    track: input.track,
    candidateName: input.candidateName,
    date: input.date,
    timeUsedSeconds: input.timeUsedSeconds,
    pausedSeconds: input.pausedSeconds,
    total,
    mark20,
    bySection,
    byFrenchDifficulty: input.difficultyBreakdownSection ? byFrenchDifficulty : undefined,
    unanswered,
    questions: attemptQuestions,
  };
}
