import { useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Button } from "../../components/Button";
import { StampBadge } from "../../components/StampBadge";
import { getQuestionBank } from "../../data/bank";
import { formatArabicNumber, toArabicNumerals } from "../../lib/format";
import { buildExam } from "../../lib/selection";
import type { TrackConfig } from "../../lib/trackConfig";
import { getExamStore, getProgressStore } from "../../lib/trackConfig";
import { PdfExportSheet } from "./PdfExportSheet";
import { ReviewList } from "./ReviewList";

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${toArabicNumerals(String(h))} س ${toArabicNumerals(String(m))} د`;
}

export function ResultsScreen() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const config = useOutletContext<TrackConfig>();
  const useExamStore = getExamStore(config.id);
  const useProgressStore = getProgressStore(config.id);
  const attempts = useProgressStore((s) => s.attempts);
  const seenIds = useProgressStore((s) => s.seenIds);
  const lastSeenAt = useProgressStore((s) => s.lastSeenAt);
  const startExam = useExamStore((s) => s.startExam);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [pdfSheetOpen, setPdfSheetOpen] = useState(false);

  const attempt = attempts.find((a) => a.id === attemptId);

  const visibleItems = useMemo(() => {
    if (!attempt) return [];
    return errorsOnly ? attempt.questions.filter((q) => q.floored < 1) : attempt.questions;
  }, [attempt, errorsOnly]);

  if (!attempt) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12 text-center">
        <p>لم يتم العثور على هذه المحاولة.</p>
      </div>
    );
  }

  const pass = attempt.mark20 >= 10;

  function handleRenew() {
    const bank = getQuestionBank(config.id);
    const exam = buildExam(bank, new Set(seenIds), lastSeenAt, {
      composition: config.composition,
      ascendingDifficultySections: config.ascendingDifficultySections,
    });
    startExam(exam);
    navigate(`/${config.routeSegment}/exam`);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col items-center gap-4 border border-ink/15 bg-paper-2 py-10">
        <StampBadge
          mark20={attempt.mark20}
          date={new Date(attempt.date).toLocaleDateString("ar")}
          pass={pass}
          emblemSrc={config.emblemSrc}
        />
        <p className="text-[length:var(--text-scale-4)] text-ink/70">
          المجموع الخام: {formatArabicNumber(attempt.total)} / {toArabicNumerals(String(attempt.questions.length))}
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-kufi text-[length:var(--text-scale-3)] font-bold text-green-dk">النتيجة حسب القسم</h2>
        <table className="w-full border border-ink/15 text-[length:var(--text-scale-4)]">
          <thead>
            <tr className="border-b border-ink/15 bg-paper text-start">
              <th className="px-3 py-2 text-start font-normal">القسم</th>
              <th className="px-3 py-2 text-start font-normal">النتيجة</th>
              <th className="px-3 py-2 text-start font-normal">الحد الأقصى</th>
              <th className="px-3 py-2 text-start font-normal">النسبة</th>
            </tr>
          </thead>
          <tbody>
            {config.sectionOrder.map((section) => {
              const s = attempt.bySection[section] ?? { score: 0, max: 0 };
              if (s.max === 0) return null;
              const pct = (s.score / s.max) * 100;
              return (
                <tr key={section} className="border-b border-ink/12 last:border-0">
                  <td className="px-3 py-2">{config.sectionLabels[section]}</td>
                  <td className="px-3 py-2 tabular-nums">{formatArabicNumber(s.score)}</td>
                  <td className="px-3 py-2 tabular-nums">{toArabicNumerals(String(s.max))}</td>
                  <td className="px-3 py-2 tabular-nums">{toArabicNumerals(pct.toFixed(0))}٪</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {config.difficultyBreakdownSection && attempt.byFrenchDifficulty && (
        <section>
          <h2 className="mb-3 font-kufi text-[length:var(--text-scale-3)] font-bold text-green-dk">
            {config.difficultyBreakdownLabel}
          </h2>
          <table className="w-full border border-ink/15 text-[length:var(--text-scale-4)]">
            <thead>
              <tr className="border-b border-ink/15 bg-paper text-start">
                <th className="px-3 py-2 text-start font-normal">المستوى</th>
                <th className="px-3 py-2 text-start font-normal">النتيجة</th>
                <th className="px-3 py-2 text-start font-normal">الحد الأقصى</th>
              </tr>
            </thead>
            <tbody>
              {([1, 2, 3, 4, 5] as const).map((level) => {
                const s = attempt.byFrenchDifficulty![level];
                return (
                  <tr key={level} className="border-b border-ink/12 last:border-0">
                    <td className="px-3 py-2 tabular-nums">{toArabicNumerals(String(level))}</td>
                    <td className="px-3 py-2 tabular-nums">{formatArabicNumber(s.score)}</td>
                    <td className="px-3 py-2 tabular-nums">{toArabicNumerals(String(s.max))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      <section className="flex flex-wrap gap-6 border border-ink/15 bg-paper-2 px-4 py-3 text-[length:var(--text-scale-4)]">
        <p>الوقت المستغرق: {formatDuration(attempt.timeUsedSeconds)}</p>
        <p>الأسئلة بلا إجابة: {toArabicNumerals(String(attempt.unanswered))}</p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleRenew}>تجديد الأسئلة</Button>
        <Button variant="secondary" onClick={() => setErrorsOnly((v) => !v)}>
          {errorsOnly ? "عرض كل الأسئلة" : "مراجعة الأخطاء فقط"}
        </Button>
        <Button variant="secondary" onClick={() => setPdfSheetOpen(true)}>
          تحميل الاختبار PDF
        </Button>
      </div>

      <PdfExportSheet open={pdfSheetOpen} onClose={() => setPdfSheetOpen(false)} attemptId={attempt.id} />

      <section>
        <h2 className="mb-3 font-kufi text-[length:var(--text-scale-3)] font-bold text-green-dk">مراجعة الأسئلة</h2>
        <ReviewList items={visibleItems} sectionLabels={config.sectionLabelsShort} />
      </section>
    </div>
  );
}
