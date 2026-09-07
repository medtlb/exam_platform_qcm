import { useOutletContext } from "react-router-dom";
import type { TrackConfig } from "../../lib/trackConfig";
import { getExamStore } from "../../lib/trackConfig";

export function QuestionGrid() {
  const config = useOutletContext<TrackConfig>();
  const useExamStore = getExamStore(config.id);
  const questions = useExamStore((s) => s.questions);
  const answers = useExamStore((s) => s.answers);
  const flagged = useExamStore((s) => s.flagged);
  const currentIndex = useExamStore((s) => s.currentIndex);
  const goTo = useExamStore((s) => s.goTo);

  return (
    <div
      className="grid grid-cols-6 gap-1.5 sm:grid-cols-10"
      role="navigation"
      aria-label="شبكة الأسئلة"
    >
      {questions.map((q, i) => {
        const answered = (answers[q.id]?.length ?? 0) > 0;
        const isFlagged = flagged.includes(q.id);
        const isCurrent = i === currentIndex;

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => goTo(i)}
            aria-current={isCurrent ? "true" : undefined}
            aria-label={`السؤال ${i + 1}${answered ? "، تمت الإجابة" : "، بلا إجابة"}${isFlagged ? "، معلّم للمراجعة" : ""}`}
            className={[
              "relative flex h-9 items-center justify-center border text-[length:var(--text-scale-5)] tabular-nums",
              isCurrent
                ? "border-brass bg-brass text-paper-2"
                : answered
                  ? "border-green bg-green/10 text-green-dk"
                  : "border-ink/25 bg-paper-2 text-ink/70",
            ].join(" ")}
          >
            {i + 1}
            {isFlagged && (
              <span className="absolute -top-1 -end-1 h-2 w-2 rounded-full bg-stamp" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}
