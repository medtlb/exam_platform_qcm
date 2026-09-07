import { Button } from "../../components/Button";
import { Sheet } from "../../components/Sheet";

type CancelExamSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function CancelExamSheet({ open, onClose, onConfirm }: CancelExamSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="إلغاء الاختبار">
      <div className="flex flex-col gap-2 text-[length:var(--text-scale-4)]">
        <p>سيتم إنهاء الاختبار الحالي دون تسجيل أي نتيجة، وستفقد كل إجاباتك.</p>
        <p className="text-[length:var(--text-scale-5)] text-ink/70">هذا الإجراء لا يمكن التراجع عنه.</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          العودة إلى الاختبار
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          إلغاء الاختبار
        </Button>
      </div>
    </Sheet>
  );
}
