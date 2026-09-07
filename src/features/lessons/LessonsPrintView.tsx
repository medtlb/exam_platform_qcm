import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getLessonModules, getLessonsIntro } from "../../data/lessonBank";
import { toArabicNumerals } from "../../lib/format";
import { exportBlocksToPdf, type PdfExportProgress } from "../../lib/pdfExport";
import { getTrackConfig, trackConfigs } from "../../lib/trackConfig";
import type { LessonModule } from "../../lib/types";
import { LessonBlocks } from "./LessonBlocks";

/** `all` for the whole guide, otherwise a single module id. */
export const ALL_MODULES = "all";

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function filenameFor(prefix: string, scope: string, date: Date): string {
  const stamp = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  return `${prefix}-lecons-${scope}-${stamp}`;
}

function LessonSheet({ module, first }: { module: LessonModule; first: boolean }) {
  return (
    <section className={first ? "" : "print-module"}>
      <div className="pdf-block print-lesson-head mt-8 border-b-2 border-green pb-2 first:mt-0">
        <h2 className="font-kufi text-[length:var(--text-scale-3)] font-bold text-green-dk">
          {module.title}
        </h2>
        <p dir="ltr" className="mt-1 text-start font-latin text-[length:var(--text-scale-5)] text-brass">
          {module.titleFr}
        </p>
        <p className="mt-1 text-[length:var(--text-scale-5)] text-ink/70">{module.subtitle}</p>
      </div>

      {module.lessons.map((lesson) => {
        const isFrench = lesson.lang === "fr";
        return (
          <div key={lesson.id} className="mt-6">
            <div className="pdf-block print-lesson-head border-b border-brass pb-2">
              <p className="font-latin text-[length:var(--text-scale-5)] tabular-nums text-brass">
                الدرس {toArabicNumerals(String(lesson.order))}
              </p>
              <h3
                className="font-kufi text-[length:var(--text-scale-4)] font-bold text-green-dk"
                dir={isFrench ? "ltr" : undefined}
                style={isFrench ? { textAlign: "start" } : undefined}
              >
                {lesson.title}
              </h3>
              {lesson.topics.length > 0 && (
                <p className="mt-1 text-[length:var(--text-scale-5)] text-ink/60">
                  <span>يُحضّر لأسئلة:</span>{" "}
                  <bdi>{lesson.topics.join(isFrench ? ", " : "، ")}</bdi>
                </p>
              )}
            </div>
            <div className="mt-3" dir={isFrench ? "ltr" : undefined}>
              <LessonBlocks blocks={lesson.blocks} forPrint />
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function LessonsPrintView() {
  const { track: trackParam } = useParams();
  const config = getTrackConfig(trackParam) ?? trackConfigs.douanes;
  const [searchParams] = useSearchParams();
  const scope = searchParams.get("module") ?? ALL_MODULES;
  const printPageRef = useRef<HTMLDivElement>(null);
  const [exportProgress, setExportProgress] = useState<PdfExportProgress | null>(null);

  const lessonModules = getLessonModules(config.id);
  const modules = useMemo(
    () => (scope === ALL_MODULES ? lessonModules : lessonModules.filter((m) => m.id === scope)),
    [scope, lessonModules],
  );

  const filename = filenameFor(config.filenamePrefix, scope, new Date());

  useEffect(() => {
    document.title = filename;
  }, [filename]);

  async function handleDirectDownload() {
    if (!printPageRef.current) return;
    const blocks = Array.from(printPageRef.current.querySelectorAll<HTMLElement>(".pdf-block"));
    setExportProgress({ current: 0, total: blocks.length });
    try {
      await exportBlocksToPdf(blocks, filename, (p) => setExportProgress(p));
    } finally {
      setExportProgress(null);
    }
  }

  if (modules.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center" dir="rtl">
        <p>لم يتم العثور على هذه الوحدة.</p>
      </div>
    );
  }

  const guideTitle = "دليل الدروس والملخصات التحضيرية";
  const heading = scope === ALL_MODULES ? guideTitle : modules[0].title;

  return (
    <div className="print-only-page min-h-screen bg-paper px-6 py-8" dir="rtl">
      <div className="no-print mb-6 flex flex-col gap-2 border border-ink/15 bg-paper-2 px-4 py-4">
        <p className="text-[length:var(--text-scale-4)] font-bold">{heading}</p>
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
        <header className="pdf-block print-lesson-head mb-8 flex items-center gap-4 border-b border-ink/20 pb-4">
          <img src={config.emblemSrc} alt="" className="h-14 w-14 object-contain" />
          <div>
            <p className="font-kufi text-[length:var(--text-scale-3)] font-bold">{guideTitle}</p>
            <p className="text-[length:var(--text-scale-5)] text-ink/70">{config.homeTitle}</p>
          </div>
        </header>

        {scope === ALL_MODULES && (
          <p className="pdf-block print-point mb-8 border-s-2 border-brass px-4 py-3 text-[length:var(--text-scale-4)] leading-relaxed">
            {getLessonsIntro(config.id)}
          </p>
        )}

        {modules.map((module, i) => (
          <LessonSheet key={module.id} module={module} first={i === 0} />
        ))}
      </div>
    </div>
  );
}
