import type { Question, Section } from "./types";

export type SessionComposition = Record<Section, number>;

export const DEFAULT_COMPOSITION: SessionComposition = {
  general: 24,
  arabic: 18,
  french: 18,
};

export const SESSION_SIZE = 60;

function shuffle<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Round-robins across difficulty buckets so the pick spreads over 1..5. */
function pickBalancedByDifficulty(
  candidates: Question[],
  count: number,
  rng: () => number,
): Question[] {
  const byDifficulty = new Map<number, Question[]>();
  for (const q of candidates) {
    const arr = byDifficulty.get(q.difficulty) ?? [];
    arr.push(q);
    byDifficulty.set(q.difficulty, arr);
  }
  for (const [d, arr] of byDifficulty) byDifficulty.set(d, shuffle(arr, rng));

  const difficulties = [...byDifficulty.keys()].sort((a, b) => a - b);
  const picked: Question[] = [];
  let i = 0;
  while (picked.length < count) {
    const remaining = difficulties.filter((d) => (byDifficulty.get(d)?.length ?? 0) > 0);
    if (remaining.length === 0) break;
    const d = difficulties[i % difficulties.length];
    i++;
    const arr = byDifficulty.get(d);
    if (!arr || arr.length === 0) continue;
    picked.push(arr.pop() as Question);
  }
  return picked;
}

/**
 * Picks `count` questions from `pool`, preferring unseen items. If the pool
 * doesn't have enough unseen items, it silently recycles the least-recently
 * seen ones to fill the rest — never surfaced to the caller as "exhausted".
 */
export function pickSection(
  pool: Question[],
  count: number,
  seenIds: ReadonlySet<string>,
  lastSeenAt: Readonly<Record<string, number>> = {},
  rng: () => number = Math.random,
): Question[] {
  const unseen = pool.filter((q) => !seenIds.has(q.id));
  let candidates: Question[];

  if (unseen.length >= count) {
    candidates = unseen;
  } else {
    const seenSorted = pool
      .filter((q) => seenIds.has(q.id))
      .sort((a, b) => (lastSeenAt[a.id] ?? 0) - (lastSeenAt[b.id] ?? 0));
    candidates = [...unseen, ...seenSorted];
  }

  return pickBalancedByDifficulty(candidates, count, rng);
}

function interleave<T>(groups: T[][]): T[] {
  const total = groups.reduce((sum, g) => sum + g.length, 0);
  const cursors = groups.map(() => 0);
  const result: T[] = [];

  for (let step = 0; step < total; step++) {
    let best = -1;
    let bestRatio = Infinity;
    for (let g = 0; g < groups.length; g++) {
      if (cursors[g] >= groups[g].length) continue;
      const ratio = cursors[g] / groups[g].length;
      if (ratio < bestRatio) {
        bestRatio = ratio;
        best = g;
      }
    }
    result.push(groups[best][cursors[best]]);
    cursors[best]++;
  }

  return result;
}

export type BuildExamOptions = {
  composition?: SessionComposition;
  /** Sections picked for this exam get sorted ascending by difficulty (douanes: ["french"]). */
  ascendingDifficultySections?: Section[];
};

/**
 * Builds one exam session out of a composition map (section -> count),
 * unseen-first with silent recycling, sections interleaved (not blocked).
 * Any section listed in `ascendingDifficultySections` is sorted ascending
 * by difficulty within its own subset (douanes' French level test).
 */
export function buildExam(
  bank: Question[],
  seenIds: ReadonlySet<string>,
  lastSeenAt: Readonly<Record<string, number>> = {},
  options: BuildExamOptions = {},
  rng: () => number = Math.random,
): Question[] {
  const composition = options.composition ?? DEFAULT_COMPOSITION;
  const ascending = new Set(options.ascendingDifficultySections ?? ["french"]);
  const bySection = (section: Section) => bank.filter((q) => q.section === section);

  const groups = Object.entries(composition).map(([section, count]) => {
    const picked = pickSection(bySection(section), count, seenIds, lastSeenAt, rng);
    return ascending.has(section) ? [...picked].sort((a, b) => a.difficulty - b.difficulty) : picked;
  });

  return interleave(groups);
}
