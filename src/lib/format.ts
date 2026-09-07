import type { Question } from "./types";

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicNumerals(value: string): string {
  return value.replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]).replace(/\./g, "٫");
}

export function formatArabicNumber(value: number, decimals = 2): string {
  return toArabicNumerals(value.toFixed(decimals));
}

export function formatMark20(mark20: number): string {
  return toArabicNumerals(mark20.toFixed(2));
}

/**
 * Spells out the per-question scoring arithmetic in Arabic, e.g.:
 * «اخترت خيارًا صحيحًا واحدًا من ٢ (+٠٫٥٠) وخيارًا خاطئًا واحدًا من ٣ (−٠٫٣٣) → ٠٫١٧»
 */
export function formatQuestionArithmetic(question: Question, selected: string[]): string {
  const correctSet = new Set(question.correct);
  const C = question.correct.length;
  const W = question.options.length - C;

  const correctTicked = selected.filter((id) => correctSet.has(id)).length;
  const wrongTicked = selected.filter((id) => !correctSet.has(id)).length;

  const correctContribution = correctTicked * (1 / C);
  const wrongContribution = W > 0 ? wrongTicked * (1 / W) : 0;
  const floored = Math.max(0, correctContribution - wrongContribution);

  const parts: string[] = [];

  if (correctTicked > 0) {
    parts.push(
      `اخترت ${toArabicNumerals(String(correctTicked))} خيارًا صحيحًا من ${toArabicNumerals(String(C))} (+${formatArabicNumber(correctContribution)})`,
    );
  }
  if (wrongTicked > 0) {
    parts.push(
      `اخترت ${toArabicNumerals(String(wrongTicked))} خيارًا خاطئًا من ${toArabicNumerals(String(W))} (−${formatArabicNumber(wrongContribution)})`,
    );
  }
  if (parts.length === 0) {
    return `لم تُجب على هذا السؤال → ٠٫٠٠`;
  }

  return `${parts.join(" و")} → ${formatArabicNumber(floored)}`;
}
