import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "../../components/Button";
import { getQuestionBank } from "../../data/bank";
import { getLessonModules } from "../../data/lessonBank";
import { toArabicNumerals } from "../../lib/format";
import { buildExam } from "../../lib/selection";
import type { Section } from "../../lib/types";
import type { TrackConfig } from "../../lib/trackConfig";
import { getExamStore, getLessonsStore, getProgressStore } from "../../lib/trackConfig";
import { useAuthStore } from "../../store/authStore";

export function HomeScreen() {
  const navigate = useNavigate();
  const config = useOutletContext<TrackConfig>();
  const useExamStore = getExamStore(config.id);
  const useProgressStore = getProgressStore(config.id);
  const useLessonsStore = getLessonsStore(config.id);
  const name = useAuthStore((s) => s.name);
  const status = useExamStore((s) => s.status);
  const startExam = useExamStore((s) => s.startExam);
  const seenIds = useProgressStore((s) => s.seenIds);
  const lastSeenAt = useProgressStore((s) => s.lastSeenAt);
  const attempts = useProgressStore((s) => s.attempts);
  const studiedIds = useLessonsStore((s) => s.studiedIds);

  const lastAttempt = attempts[attempts.length - 1];
  const lessonTotal = config.hasLessons
    ? getLessonModules(config.id).reduce((sum, m) => sum + m.lessons.length, 0)
    : 0;

  function handleStart() {
    const bank = getQuestionBank(config.id);
    const exam = buildExam(bank, new Set(seenIds), lastSeenAt, {
      composition: config.composition,
      ascendingDifficultySections: config.ascendingDifficultySections,
    });
    startExam(exam);
    navigate(`/${config.routeSegment}/exam`);
  }

  function handleStartSection(section: Section) {
    const bank = getQuestionBank(config.id);
    const exam = buildExam(bank, new Set(seenIds), lastSeenAt, {
      composition: { [section]: config.sessionSize },
      ascendingDifficultySections: config.ascendingDifficultySections,
    });
    startExam(exam);
    navigate(`/${config.routeSegment}/exam`);
  }

  function handleResume() {
    navigate(`/${config.routeSegment}/exam`);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <div className="flex flex-col items-center gap-3">
        <img src={config.emblemSrc} alt="" className="h-20 w-20 object-contain" />
        <h1 className="font-kufi text-[length:var(--text-scale-2)] font-bold text-green-dk">
          أهلاً {name}
        </h1>
        <p className="max-w-md text-[length:var(--text-scale-4)] text-ink/80">{config.homeTitle}</p>
      </div>

      {status === "running" ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-[length:var(--text-scale-4)]">لديك اختبار جارٍ لم يكتمل بعد.</p>
          <Button onClick={handleResume}>متابعة الاختبار</Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Button onClick={handleStart}>بدء اختبار جديد</Button>

          {config.sideExamSections && config.sideExamSections.length > 0 && (
            <div className="flex flex-col items-center gap-2 border-t border-ink/15 pt-4">
              <p className="text-[length:var(--text-scale-5)] text-ink/70">
                أو تدرّب على محور واحد فقط ({toArabicNumerals(String(config.sessionSize))} سؤالاً)
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {config.sideExamSections.map((section) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => handleStartSection(section)}
                    className="rounded-[2px] border border-ink/40 px-4 py-2 text-[length:var(--text-scale-5)] hover:border-ink"
                  >
                    {config.sectionLabelsShort[section]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {lastAttempt && (
        <div className="border border-ink/15 bg-paper-2 px-6 py-4 text-[length:var(--text-scale-5)]">
          آخر نتيجة: <span className="font-bold text-green-dk">{lastAttempt.mark20.toFixed(2)} / 20</span>
        </div>
      )}

      {config.hasLessons && (
        <div className="flex w-full max-w-md flex-col items-center gap-2 border-t border-ink/15 pt-8">
          <p className="text-[length:var(--text-scale-5)] text-ink/70">
            راجع الدروس والملخصات التحضيرية قبل الاختبار.
          </p>
          <Link
            to={`/${config.routeSegment}/lessons`}
            className="rounded-[2px] border border-ink/40 px-5 py-2.5 text-[length:var(--text-scale-4)] hover:border-ink"
          >
            الدروس التحضيرية ({toArabicNumerals(String(studiedIds.length))} من{" "}
            {toArabicNumerals(String(lessonTotal))})
          </Link>
        </div>
      )}
    </div>
  );
}
