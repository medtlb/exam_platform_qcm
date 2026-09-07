import { useOutletContext } from "react-router-dom";
import { Button } from "../../components/Button";
import { toArabicNumerals } from "../../lib/format";
import type { TrackConfig } from "../../lib/trackConfig";
import { getLessonsStore, getProgressStore } from "../../lib/trackConfig";

export function SettingsScreen() {
  const config = useOutletContext<TrackConfig>();
  const useProgressStore = getProgressStore(config.id);
  const useLessonsStore = getLessonsStore(config.id);
  const attempts = useProgressStore((s) => s.attempts);
  const resetTrainingHistory = useProgressStore((s) => s.resetTrainingHistory);
  const studiedIds = useLessonsStore((s) => s.studiedIds);
  const resetLessonProgress = useLessonsStore((s) => s.resetLessonProgress);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="font-kufi text-[length:var(--text-scale-2)] font-bold text-green-dk">الإعدادات</h1>

      <div className="border border-ink/15 bg-paper-2 px-4 py-4">
        <p className="mb-1 text-[length:var(--text-scale-4)]">
          {toArabicNumerals(String(attempts.length))} محاولة مسجّلة في سجل التدريب.
        </p>
        <p className="mb-4 text-[length:var(--text-scale-5)] text-ink/60">
          إعادة الضبط تحذف جميع المحاولات السابقة وتعيد تصنيف كل الأسئلة كغير مرئية.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            if (confirm("هل تريد بالتأكيد إعادة ضبط سجل التدريب بالكامل؟")) {
              resetTrainingHistory();
            }
          }}
        >
          إعادة ضبط سجل التدريب
        </Button>
      </div>

      {config.hasLessons && (
        <div className="border border-ink/15 bg-paper-2 px-4 py-4">
          <p className="mb-1 text-[length:var(--text-scale-4)]">
            {toArabicNumerals(String(studiedIds.length))} درسًا مؤشّرًا كمدروس.
          </p>
          <p className="mb-4 text-[length:var(--text-scale-5)] text-ink/60">
            إعادة الضبط تمسح علامات الدروس المدروسة فقط، دون المساس بسجل المحاولات.
          </p>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("هل تريد بالتأكيد مسح تقدّمك في الدروس؟")) {
                resetLessonProgress();
              }
            }}
          >
            إعادة ضبط تقدّم الدروس
          </Button>
        </div>
      )}
    </div>
  );
}
