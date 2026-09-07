import { useOutletContext } from "react-router-dom";
import { Checkbox } from "../../components/Checkbox";
import type { TrackConfig } from "../../lib/trackConfig";
import { getExamStore } from "../../lib/trackConfig";
import type { Question } from "../../lib/types";

type QuestionCardProps = {
  question: Question;
  index: number;
  total: number;
};

// Stable reference so the zustand selector below doesn't return a new
// array on every call when there's no answer yet (which would make
// useSyncExternalStore see a "changed" snapshot every render and loop).
const NO_SELECTION: string[] = [];

export function QuestionCard({ question, index, total }: QuestionCardProps) {
  const config = useOutletContext<TrackConfig>();
  const useExamStore = getExamStore(config.id);
  const selected = useExamStore((s) => s.answers[question.id] ?? NO_SELECTION);
  const toggleOption = useExamStore((s) => s.toggleOption);
  const flagged = useExamStore((s) => s.flagged.includes(question.id));
  const toggleFlag = useExamStore((s) => s.toggleFlag);

  const isLtr = question.lang === "fr";

  return (
    <div className="border border-ink/15 bg-paper-2">
      <div className="flex items-center justify-between border-b border-ink/12 px-4 py-2 sm:px-6">
        <div className="flex items-baseline gap-3">
          <span className="font-kufi text-[length:var(--text-scale-2)] font-bold text-brass">
            {index + 1}
          </span>
          <span className="text-[length:var(--text-scale-5)] text-ink/60">/ {total}</span>
          <span className="border border-ink/20 px-2 py-0.5 text-[length:var(--text-scale-5)] text-ink/70">
            {config.sectionLabelsShort[question.section]}
          </span>
        </div>
        <label className="flex items-center gap-2 text-[length:var(--text-scale-5)]">
          <input
            type="checkbox"
            checked={flagged}
            onChange={() => toggleFlag(question.id)}
            className="h-4 w-4 accent-brass"
          />
          مراجعة
        </label>
      </div>

      <div className="px-4 py-6 sm:px-6" dir={isLtr ? "ltr" : "rtl"}>
        <p className="mb-6 text-[length:var(--text-scale-3)] leading-relaxed whitespace-pre-line">
          {question.prompt}
        </p>

        <div className="border-t border-ink/12">
          {question.options.map((option, i) => (
            <div
              key={option.id}
              className="flex items-center gap-3 border-b border-ink/12 px-2 py-3"
            >
              <span className="w-5 shrink-0 text-center text-[length:var(--text-scale-5)] text-ink/40">
                {i + 1}
              </span>
              <Checkbox
                id={`${question.id}-${option.id}`}
                label={option.text}
                checked={selected.includes(option.id)}
                onChange={() => toggleOption(question.id, option.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
