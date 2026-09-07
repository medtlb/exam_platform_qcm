import { useNavigate } from "react-router-dom";
import { Sheet } from "../../components/Sheet";
import { getLessonModules } from "../../data/lessonBank";
import { toArabicNumerals } from "../../lib/format";
import type { TrackConfig } from "../../lib/trackConfig";
import { ALL_MODULES } from "./LessonsPrintView";

type LessonsPdfSheetProps = {
  open: boolean;
  onClose: () => void;
  config: TrackConfig;
};

export function LessonsPdfSheet({ open, onClose, config }: LessonsPdfSheetProps) {
  const navigate = useNavigate();
  const lessonModules = getLessonModules(config.id);
  const total = lessonModules.reduce((sum, m) => sum + m.lessons.length, 0);

  function choose(scope: string) {
    onClose();
    navigate(`/${config.routeSegment}/lessons/print?module=${scope}`);
  }

  return (
    <Sheet open={open} onClose={onClose} title="تحميل الدروس PDF">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => choose(ALL_MODULES)}
          className="border border-ink/20 px-4 py-3 text-start hover:border-brass"
        >
          <span className="block text-[length:var(--text-scale-4)] font-bold">الدليل كاملًا</span>
          <span className="block text-[length:var(--text-scale-5)] text-ink/60">
            كل الوحدات في ملف واحد — {toArabicNumerals(String(total))} درسًا.
          </span>
        </button>

        {lessonModules.map((module) => (
          <button
            key={module.id}
            type="button"
            onClick={() => choose(module.id)}
            className="border border-ink/20 px-4 py-3 text-start hover:border-brass"
          >
            <span className="block text-[length:var(--text-scale-4)] font-bold">{module.title}</span>
            <span className="block text-[length:var(--text-scale-5)] text-ink/60">
              {toArabicNumerals(String(module.lessons.length))} دروس — {module.subtitle}
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
