import type { AttemptQuestion, Section } from "../../lib/types";
import { formatArabicNumber, formatQuestionArithmetic, toArabicNumerals } from "../../lib/format";

const DOUANES_SECTION_LABELS: Record<Section, string> = {
  general: "ثقافة عامة",
  arabic: "لغة عربية",
  french: "لغة فرنسية",
};

type ReviewListProps = {
  items: AttemptQuestion[];
  startIndex?: number;
  sectionLabels?: Record<Section, string>;
};

export function ReviewList({ items, startIndex = 0, sectionLabels = DOUANES_SECTION_LABELS }: ReviewListProps) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => {
        const isLtr = item.question.lang === "fr";
        const correctSet = new Set(item.question.correct);
        const zeroed = item.floored === 0;

        return (
          <div key={item.question.id} className="print-question border border-ink/15 bg-paper-2 break-inside-avoid">
            <div className="flex items-center justify-between border-b border-ink/12 px-4 py-2">
              <div className="flex items-baseline gap-3">
                <span className="font-kufi text-[length:var(--text-scale-3)] font-bold text-brass">
                  {toArabicNumerals(String(startIndex + i + 1))}
                </span>
                <span className="border border-ink/20 px-2 py-0.5 text-[length:var(--text-scale-5)] text-ink/70">
                  {sectionLabels[item.question.section]}
                </span>
              </div>
              <span
                className={[
                  "text-[length:var(--text-scale-5)] font-bold",
                  zeroed ? "text-stamp" : "text-green-dk",
                ].join(" ")}
              >
                {formatArabicNumber(item.floored)}
              </span>
            </div>

            <div className="px-4 py-4" dir={isLtr ? "ltr" : "rtl"}>
              <p className="mb-3 text-[length:var(--text-scale-4)] leading-relaxed whitespace-pre-line">
                {item.question.prompt}
              </p>

              <div className="border-t border-ink/12">
                {item.question.options.map((option) => {
                  const ticked = item.selected.includes(option.id);
                  const isCorrect = correctSet.has(option.id);
                  return (
                    <div
                      key={option.id}
                      className={[
                        "flex items-center gap-2 border-b border-ink/12 px-2 py-2 text-[length:var(--text-scale-4)]",
                        isCorrect ? "bg-green/10" : ticked ? "bg-stamp/10" : "",
                      ].join(" ")}
                    >
                      <span className="w-5 shrink-0 text-center">{ticked ? "✓" : ""}</span>
                      <span className="flex-1">{option.text}</span>
                      {isCorrect && <span className="shrink-0 text-[length:var(--text-scale-5)] text-green-dk">صحيح</span>}
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-[length:var(--text-scale-5)] text-ink/70">
                {formatQuestionArithmetic(item.question, item.selected)}
              </p>
              <p className="mt-2 text-[length:var(--text-scale-5)] leading-relaxed">{item.question.explanation}</p>
              {item.question.source && (
                <p className="mt-1 text-[length:var(--text-scale-5)] text-ink/50">{item.question.source}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
