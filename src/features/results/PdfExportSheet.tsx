import { useNavigate } from "react-router-dom";
import { Sheet } from "../../components/Sheet";

export type PdfMode = "complet" | "erreurs" | "vierge";

type PdfExportSheetProps = {
  open: boolean;
  onClose: () => void;
  attemptId: string;
};

const MODES: { mode: PdfMode; label: string; help: string }[] = [
  { mode: "complet", label: "النسخة الكاملة", help: "كل الأسئلة بإجاباتك والتصحيح والشرح." },
  { mode: "erreurs", label: "الأخطاء فقط", help: "الأسئلة التي لم تحصل فيها على العلامة كاملة." },
  { mode: "vierge", label: "نسخة للطباعة بدون إجابات", help: "الأسئلة فقط، لإعادة حل الاختبار يدويًا." },
];

export function PdfExportSheet({ open, onClose, attemptId }: PdfExportSheetProps) {
  const navigate = useNavigate();

  function choose(mode: PdfMode) {
    onClose();
    navigate(`/attempt/${attemptId}/print?mode=${mode}`);
  }

  return (
    <Sheet open={open} onClose={onClose} title="تحميل الاختبار PDF">
      <div className="flex flex-col gap-2">
        {MODES.map((m) => (
          <button
            key={m.mode}
            type="button"
            onClick={() => choose(m.mode)}
            className="border border-ink/20 px-4 py-3 text-start hover:border-brass"
          >
            <span className="block text-[length:var(--text-scale-4)] font-bold">{m.label}</span>
            <span className="block text-[length:var(--text-scale-5)] text-ink/60">{m.help}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
