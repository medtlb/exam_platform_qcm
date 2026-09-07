import {
  COMPOSITION_TOLERANCE,
  FRENCH_DIFFICULTY_TARGETS,
  MIN_OPTIONS,
  MIN_SHARE_WITH_6_PLUS_OPTIONS,
  MULTI_CORRECT_TARGET,
  MULTI_CORRECT_TOLERANCE,
  SECTION_TARGETS,
  TRESOR_SECTION_TARGETS,
} from "./bankTargets";
import type { Question, Section, Track } from "./types";

const SECTIONS_BY_TRACK: Record<Track, Section[]> = {
  douanes: ["general", "arabic", "french"],
  tresor: Object.keys(TRESOR_SECTION_TARGETS),
};
const LANGS = ["ar", "fr"];
const DIFFICULTIES = [1, 2, 3, 4, 5];

// Arabic combining marks (tashkeel: ؐ-ؚ, ً-ٟ, ٰ,
// ۖ-ۭ) plus tatweel (ـ), written as explicit code points to
// avoid any literal-glyph encoding ambiguity.
const ARABIC_DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭ]/g;
const TATWEEL = /ـ/g;
// ASCII punctuation + Arabic punctuation (، comma, ؛ semicolon,
// ؟ question mark, ٫ decimal separator) + curly quotes/dashes.
const PUNCTUATION =
  /[.,;:!?"'«»“”‘’…\-–—_()[\]{}/\\|@#$%^&*+=~`٫،؛؟]/g;

export function normalizeText(text: string): string {
  return text
    .replace(ARABIC_DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(PUNCTUATION, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Schema-level checks for a single question. Returns a list of error strings (empty = valid). */
export function validateQuestion(q: Question): string[] {
  const errors: string[] = [];
  const tag = q?.id || "(no id)";

  if (!q.id || typeof q.id !== "string") errors.push(`${tag}: missing or invalid id`);
  if (!q.track || !SECTIONS_BY_TRACK[q.track]) {
    errors.push(`${tag}: invalid track "${q.track}"`);
  } else if (!SECTIONS_BY_TRACK[q.track].includes(q.section)) {
    errors.push(`${tag}: invalid section "${q.section}" for track "${q.track}"`);
  }
  if (!q.topic || typeof q.topic !== "string") errors.push(`${tag}: missing topic`);
  if (!DIFFICULTIES.includes(q.difficulty)) errors.push(`${tag}: invalid difficulty "${q.difficulty}"`);
  if (!LANGS.includes(q.lang)) errors.push(`${tag}: invalid lang "${q.lang}"`);
  if (!q.prompt || !q.prompt.trim()) errors.push(`${tag}: empty prompt`);

  if (!Array.isArray(q.options) || q.options.length < MIN_OPTIONS) {
    errors.push(`${tag}: fewer than ${MIN_OPTIONS} options`);
  }

  const options = Array.isArray(q.options) ? q.options : [];
  const optionIds = new Set(options.map((o) => o.id));
  if (optionIds.size !== options.length) errors.push(`${tag}: duplicate option ids`);
  for (const o of options) {
    if (!o.text || !o.text.trim()) errors.push(`${tag}: empty option text (${o.id})`);
  }

  if (!Array.isArray(q.correct) || q.correct.length === 0) {
    errors.push(`${tag}: empty correct array`);
  } else {
    if (q.correct.length >= options.length && options.length > 0) {
      errors.push(`${tag}: correct array covers every option`);
    }
    for (const cid of q.correct) {
      if (!optionIds.has(cid)) errors.push(`${tag}: correct id "${cid}" not found in options`);
    }
  }

  if (!q.explanation || !q.explanation.trim()) errors.push(`${tag}: missing explanation`);

  return errors;
}

export function findDuplicateIds(bank: Question[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const q of bank) {
    if (seen.has(q.id)) duplicates.add(q.id);
    seen.add(q.id);
  }
  return [...duplicates];
}

export type DuplicatePromptGroup = { ids: string[]; normalized: string };

/** Groups questions whose normalized prompt text collides (duplicate or near-duplicate). */
export function findDuplicatePrompts(bank: Question[]): DuplicatePromptGroup[] {
  const byNormalized = new Map<string, string[]>();
  for (const q of bank) {
    const key = normalizeText(q.prompt ?? "");
    const ids = byNormalized.get(key) ?? [];
    ids.push(q.id);
    byNormalized.set(key, ids);
  }
  return [...byNormalized.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([normalized, ids]) => ({ normalized, ids }));
}

/**
 * Compares the actual share of each key (as produced by `keyOf`) against
 * `targets`, failing loudly on anything more than `tolerance` off.
 */
export function checkComposition(
  bank: Question[],
  keyOf: (q: Question) => string,
  targets: Record<string, number>,
  tolerance = COMPOSITION_TOLERANCE,
): string[] {
  const errors: string[] = [];
  if (bank.length === 0) return errors;

  const counts = new Map<string, number>();
  for (const q of bank) {
    const key = keyOf(q);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  for (const [key, target] of Object.entries(targets)) {
    const actual = (counts.get(key) ?? 0) / bank.length;
    if (Math.abs(actual - target) > tolerance) {
      errors.push(
        `composition drift on "${key}": expected ${(target * 100).toFixed(1)}%, got ${(actual * 100).toFixed(1)}%`,
      );
    }
  }

  for (const key of counts.keys()) {
    if (!(key in targets)) {
      errors.push(`composition: unexpected key "${key}" has no target`);
    }
  }

  return errors;
}

export function checkSectionComposition(
  bank: Question[],
  tolerance = COMPOSITION_TOLERANCE,
  targets: Record<string, number> = SECTION_TARGETS,
): string[] {
  return checkComposition(bank, (q) => q.section, targets, tolerance);
}

/** French difficulty spread (§5.4): target 60/70/70/60/40 out of 300, i.e. shares of the french subset. */
export function checkFrenchDifficultyComposition(bank: Question[], tolerance = COMPOSITION_TOLERANCE): string[] {
  const french = bank.filter((q) => q.section === "french");
  const targets: Record<string, number> = Object.fromEntries(
    Object.entries(FRENCH_DIFFICULTY_TARGETS).map(([d, share]) => [d, share]),
  );
  return checkComposition(french, (q) => String(q.difficulty), targets, tolerance).map(
    (e) => `french ${e}`,
  );
}

export function checkLongOptionsShare(bank: Question[]): string[] {
  if (bank.length === 0) return [];
  const share = bank.filter((q) => (q.options?.length ?? 0) >= 6).length / bank.length;
  if (share < MIN_SHARE_WITH_6_PLUS_OPTIONS) {
    return [
      `only ${(share * 100).toFixed(1)}% of the bank has 6+ options, expected at least ${MIN_SHARE_WITH_6_PLUS_OPTIONS * 100}%`,
    ];
  }
  return [];
}

export function checkMultiCorrectShare(bank: Question[]): string[] {
  if (bank.length === 0) return [];
  const share = bank.filter((q) => (q.correct?.length ?? 0) >= 2).length / bank.length;
  if (Math.abs(share - MULTI_CORRECT_TARGET) > MULTI_CORRECT_TOLERANCE) {
    return [
      `${(share * 100).toFixed(1)}% of the bank is multi-correct, expected ~${MULTI_CORRECT_TARGET * 100}% (±${MULTI_CORRECT_TOLERANCE * 100}pt)`,
    ];
  }
  return [];
}

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export type ValidateBankOptions = {
  /** Skip composition/ratio checks — useful when validating a partial batch. */
  checkComposition?: boolean;
  /** Which track's section targets to check composition against. Defaults to douanes. */
  track?: Track;
};

const SECTION_TARGETS_BY_TRACK: Record<Track, Record<string, number>> = {
  douanes: SECTION_TARGETS,
  tresor: TRESOR_SECTION_TARGETS,
};

export function validateBank(bank: Question[], options: ValidateBankOptions = {}): ValidationResult {
  const errors: string[] = [];
  const track = options.track ?? "douanes";

  for (const q of bank) errors.push(...validateQuestion(q));

  const dupIds = findDuplicateIds(bank);
  for (const id of dupIds) errors.push(`duplicate id: ${id}`);

  for (const group of findDuplicatePrompts(bank)) {
    errors.push(`duplicate/near-duplicate prompt across: ${group.ids.join(", ")}`);
  }

  if (options.checkComposition) {
    errors.push(...checkSectionComposition(bank, COMPOSITION_TOLERANCE, SECTION_TARGETS_BY_TRACK[track]));
    errors.push(...checkLongOptionsShare(bank));
    errors.push(...checkMultiCorrectShare(bank));
    if (track === "douanes") errors.push(...checkFrenchDifficultyComposition(bank));
  }

  return { valid: errors.length === 0, errors };
}
