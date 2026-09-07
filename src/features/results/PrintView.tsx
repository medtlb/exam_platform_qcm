import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { StampBadge } from "../../components/StampBadge";
import { formatArabicNumber, toArabicNumerals } from "../../lib/format";
import { exportBlocksToPdf, type PdfExportProgress } from "../../lib/pdfExport";
import type { TrackConfig } from "../../lib/trackConfig";
import { getTrackConfig } from "../../lib/trackConfig";
import { useDouanesProgressStore, useTresorProgressStore } from "../../store/progressStore";
import type { Section } from "../../lib/types";
import type { PdfMode } from "./PdfExportSheet";
import { ReviewList } from "./ReviewList";

const MODE_LABELS: Record<PdfMode, string> = {
  complet: "النسخة الكاملة",
  erreurs: "الأخطاء فقط",
  vierge: "نسخة للطباعة بدون إجابات",
};

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function filenameFor(prefix: string, mode: PdfMode, date: Date): string {
  const stamp = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}-${pad2(date.getHours())}${pad2(date.getMinutes())}`;
  return `${prefix}-${mode}-${stamp}`;
}

function BlankQuestionList({
  items,
  sectionLabels,
}: {
  items: { question: { id: string; section: Section; lang: string; prompt: string; options: { id: string; text: string }[] } }[];
  sectionLabels: Record<Section, string>;
}) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => {
        const isLtr = item.question.lang === "fr";
        return (
          <div key={item.question.id} className="print-question border border-ink/15 px-4 py-4">
            <div className="print-prompt mb-3 flex items-baseline gap-3">
              <span className="font-kufi text-[length:var(--text-scale-3)] font-bold text-brass">
                {toArabicNumerals(String(i + 1))}
              </span>
              <span className="border border-ink/20 px-2 py-0.5 text-[length:var(--text-scale-5)]">
                {sectionLabels[item.question.section]}
              </span>
            </div>
            <div dir={isLtr ? "ltr" : "rtl"}>
              <p className="mb-3 text-[length:var(--text-scale-4)] leading-relaxed whitespace-pre-line">
                {item.question.prompt}
              </p>
              <div className="border-t border-ink/12">
                {item.question.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-2 border-b border-ink/12 px-2 py-2">
                    <span className="h-4 w-4 shrink-0 border border-ink/50" aria-hidden="true" />
                    <span className="flex-1 text-[length:var(--text-scale-4)]">{option.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PrintView() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") as PdfMode) ?? "complet";
  // PrintView sits outside the /:track subtree (it's a standalone print
  // route), so it has no TrackConfig from context — look the attempt up in
  // both progress stores and derive the track (and its config) from it.
  const douanesAttempt = useDouanesProgressStore((s) => s.attempts.find((a) => a.id === attemptId));
  const tresorAttempt = useTresorProgressStore((s) => s.attempts.find((a) => a.id === attemptId));
  const attempt = douanesAttempt ?? tresorAttempt;
  const config: TrackConfig | undefined = attempt ? getTrackConfig(attempt.track) : undefined;
  const printPageRef = useRef<HTMLDivElement>(null);
  const [exportProgress, setExportProgress] = useState<PdfExportProgress | null>(null);

  const visibleItems = useMemo(() => {
    if (!attempt) return [];
    return mode === "erreurs" ? attempt.questions.filter((q) => q.floored < 1) : attempt.questions;
  }, [attempt, mode]);

  useEffect(() => {
    if (!attempt || !config) return;
    document.title = filenameFor(config.filenamePrefix, mode, new Date(attempt.date));
  }, [attempt, config, mode]);

  async function handleDirectDownload() {
    if (!printPageRef.current || !attempt || !config) return;
    const blocks = Array.from(
      printPageRef.current.querySelectorAll<HTMLElement>(".pdf-block, .print-question"),
    );
    setExportProgress({ current: 0, total: blocks.length });
    try {
      await exportBlocksToPdf(blocks, filenameFor(config.filenamePrefix, mode, new Date(attempt.date)), (p) =>
        setExportProgress(p),
      );
    } finally {
      setExportProgress(null);
    }
  }

  if (!attempt || !config) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <p>لم يتم العثور على هذه المحاولة.</p>
      </div>
    );
  }

  const pass = attempt.mark20 >= 10;
  const attemptDate = new Date(attempt.date);

  return (
    <div className="print-only-page min-h-screen bg-paper px-6 py-8" dir="rtl" data-track={config.id}>
      <div className="no-print mb-6 flex flex-col gap-2 border border-ink/15 bg-paper-2 px-4 py-4">
        <p className="text-[length:var(--text-scale-4)] font-bold">{MODE_LABELS[mode]}</p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-fit border border-ink/40 bg-green px-5 py-2 text-paper-2 hover:bg-green-dk"
          >
            طباعة / حفظ كملف PDF
          </button>
          <button
            type="button"
            onClick={handleDirectDownload}
            disabled={exportProgress !== null}
            className="w-fit border border-ink/40 px-5 py-2 hover:border-ink disabled:opacity-50"
          >
            {exportProgress
              ? `جارٍ التحضير… ${toArabicNumerals(String(exportProgress.current))}/${toArabicNumerals(String(exportProgress.total))}`
              : "تنزيل مباشر (ملف PDF)"}
          </button>
        </div>
        <p className="text-[length:var(--text-scale-5)] text-ink/60">
          في نافذة الطباعة التي ستظهر، اختر «حفظ كملف PDF» (Save as PDF) من قائمة الطابعة، ثم اضغط «حفظ». أو استخدم
          «تنزيل مباشر» لحفظ الملف دون المرور بنافذة الطباعة.
        </p>
      </div>

      <div className="print-page" ref={printPageRef}>
        <header className="pdf-block mb-8 flex items-center gap-4 border-b border-ink/20 pb-4">
          <img src={config.emblemSrc} alt="" className="h-14 w-14 object-contain" />
          <div>
            <p className="font-kufi text-[length:var(--text-scale-3)] font-bold">{config.homeTitle}</p>
            <p className="text-[length:var(--text-scale-5)] text-ink/70">
              {attempt.candidateName} — {attemptDate.toLocaleDateString("ar")} {attemptDate.toLocaleTimeString("ar")}
            </p>
          </div>
        </header>

        {mode !== "vierge" && (
          <section className="pdf-block mb-8">
            <div className="mb-6 flex flex-col items-center gap-2">
              <StampBadge
                mark20={attempt.mark20}
                date={attemptDate.toLocaleDateString("ar")}
                pass={pass}
                emblemSrc={config.emblemSrc}
              />
              <p className="text-[length:var(--text-scale-4)]">
                المجموع الخام: {formatArabicNumber(attempt.total)} / {toArabicNumerals(String(attempt.questions.length))}
              </p>
            </div>

            <table className="mb-4 w-full border border-ink/20 text-[length:var(--text-scale-4)]">
              <thead>
                <tr className="border-b border-ink/20">
                  <th className="px-3 py-2 text-start font-normal">القسم</th>
                  <th className="px-3 py-2 text-start font-normal">النتيجة</th>
                  <th className="px-3 py-2 text-start font-normal">الحد الأقصى</th>
                </tr>
              </thead>
              <tbody>
                {config.sectionOrder.map((section) => {
                  const s = attempt.bySection[section] ?? { score: 0, max: 0 };
                  if (s.max === 0) return null;
                  return (
                    <tr key={section} className="border-b border-ink/12 last:border-0">
                      <td className="px-3 py-2">{config.sectionLabels[section]}</td>
                      <td className="px-3 py-2 tabular-nums">{formatArabicNumber(s.score)}</td>
                      <td className="px-3 py-2 tabular-nums">{toArabicNumerals(String(s.max))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {config.difficultyBreakdownSection && attempt.byFrenchDifficulty && (
              <table className="w-full border border-ink/20 text-[length:var(--text-scale-4)]">
                <thead>
                  <tr className="border-b border-ink/20">
                    <th className="px-3 py-2 text-start font-normal">{config.difficultyBreakdownLabel}</th>
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
            )}
          </section>
        )}

        <section>
          {mode === "vierge" ? (
            <BlankQuestionList items={attempt.questions} sectionLabels={config.sectionLabels} />
          ) : (
            <ReviewList items={visibleItems} sectionLabels={config.sectionLabelsShort} />
          )}
        </section>

        <div className="print-footer" aria-hidden="true">
          {attemptDate.toLocaleDateString("ar")} —{" "}
        </div>
      </div>
    </div>
  );
}
