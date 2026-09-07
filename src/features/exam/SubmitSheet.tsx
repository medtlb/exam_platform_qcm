import { useOutletContext } from "react-router-dom";
import { Button } from "../../components/Button";
import { Sheet } from "../../components/Sheet";
import type { TrackConfig } from "../../lib/trackConfig";
import { getExamStore } from "../../lib/trackConfig";

type SubmitSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function SubmitSheet({ open, onClose, onConfirm }: SubmitSheetProps) {
  const config = useOutletContext<TrackConfig>();
  const useExamStore = getExamStore(config.id);
  const questions = useExamStore((s) => s.questions);
  const answers = useExamStore((s) => s.answers);
  const flagged = useExamStore((s) => s.flagged);

  const unanswered = questions.filter((q) => (answers[q.id]?.length ?? 0) === 0).length;

  return (
    <Sheet open={open} onClose={onClose} title="تأكيد تسليم الاختبار">
      <div className="flex flex-col gap-2 text-[length:var(--text-scale-4)]">
        <p>
          عدد الأسئلة بلا إجابة: <span className="font-bold text-stamp">{unanswered}</span>
        </p>
        <p>
          عدد الأسئلة المعلَّمة للمراجعة: <span className="font-bold">{flagged.length}</span>
        </p>
        <p className="mt-2 text-[length:var(--text-scale-5)] text-ink/70">
          بعد التسليم لن تتمكن من تعديل إجاباتك.
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          العودة إلى الاختبار
        </Button>
        <Button onClick={onConfirm}>تسليم الاختبار</Button>
      </div>
    </Sheet>
  );
}
