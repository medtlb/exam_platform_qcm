import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getLessonByTrack, getLessonModules, getLessonsIntro } from "../../data/lessonBank";
import { toArabicNumerals } from "../../lib/format";
import type { Lesson, LessonModule, Track } from "../../lib/types";
import { getLessonsStore, getTrackConfig, trackConfigs, type TrackConfig } from "../../lib/trackConfig";
import { LessonsPdfSheet } from "./LessonsPdfSheet";

function StudiedTick({ studied }: { studied: boolean }) {
  if (!studied) return <span className="w-4 shrink-0" aria-hidden="true" />;
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-none stroke-green stroke-2" role="img">
      <title>تمت دراسته</title>
      <path d="M2 8.5 6 12.5 14 3.5" strokeLinecap="square" />
    </svg>
  );
}

function ProgressRule({ done, total }: { done: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div
      className="h-1 w-full bg-ink/12"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
    >
      <div className="h-full bg-brass" style={{ width: `${percent}%` }} />
    </div>
  );
}

function LessonRow({
  lesson,
  studied,
  routeSegment,
}: {
  lesson: Lesson;
  studied: boolean;
  routeSegment: string;
}) {
  return (
    <Link
      to={`/${routeSegment}/lessons/${lesson.id}`}
      className="flex items-baseline gap-3 border-t border-ink/12 px-4 py-3 hover:bg-paper focus-visible:bg-paper"
    >
      <span className="font-latin text-[length:var(--text-scale-5)] tabular-nums text-brass">
        {toArabicNumerals(String(lesson.order))}
      </span>
      <span
        className="min-w-0 flex-1 text-[length:var(--text-scale-4)]"
        dir={lesson.lang === "fr" ? "ltr" : undefined}
      >
        {lesson.title}
      </span>
      <span className="shrink-0 text-[length:var(--text-scale-5)] text-ink/55">
        {toArabicNumerals(String(lesson.points))} نقطة
      </span>
      <StudiedTick studied={studied} />
    </Link>
  );
}

function ModuleCard({
  module,
  studiedIds,
  routeSegment,
}: {
  module: LessonModule;
  studiedIds: string[];
  routeSegment: string;
}) {
  const done = module.lessons.filter((l) => studiedIds.includes(l.id)).length;

  return (
    <section className="border border-ink/15 bg-paper-2">
      <header className="bg-green-dk px-4 py-3 text-paper-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-kufi text-[length:var(--text-scale-4)] font-bold">{module.title}</h2>
          <Link
            to={`/${routeSegment}/lessons/print?module=${module.id}`}
            className="shrink-0 border border-paper-2/40 px-2 py-1 text-[length:var(--text-scale-5)] hover:border-brass hover:text-brass"
            title="تحميل هذه الوحدة كملف PDF"
          >
            PDF
          </Link>
        </div>
        <p dir="ltr" className="mt-0.5 text-start font-latin text-[length:var(--text-scale-5)] text-brass">
          {module.titleFr}
        </p>
        <p className="mt-1 text-[length:var(--text-scale-5)] text-paper-2/75">{module.subtitle}</p>
      </header>

      <p className="px-4 py-2 text-[length:var(--text-scale-5)] text-ink/60">
        {toArabicNumerals(String(done))} من {toArabicNumerals(String(module.lessons.length))} دروس مدروسة
      </p>

      <div className="flex flex-col">
        {module.lessons.map((lesson) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            studied={studiedIds.includes(lesson.id)}
            routeSegment={routeSegment}
          />
        ))}
      </div>
    </section>
  );
}

export function LessonsScreen() {
  const { track: trackParam } = useParams();
  const config: TrackConfig = getTrackConfig(trackParam) ?? trackConfigs.douanes;
  const useLessonsStore = getLessonsStore(config.id as Track);
  const [pdfSheetOpen, setPdfSheetOpen] = useState(false);
  const studiedIds = useLessonsStore((s) => s.studiedIds);
  const lastOpenedId = useLessonsStore((s) => s.lastOpenedId);

  if (!config.hasLessons) return <Navigate to={`/${config.routeSegment}`} replace />;

  const modules = getLessonModules(config.id);
  const total = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const done = studiedIds.length;
  const resume = lastOpenedId ? getLessonByTrack(config.id, lastOpenedId) : undefined;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3">
        <h1 className="font-kufi text-[length:var(--text-scale-2)] font-bold text-green-dk">
          الدروس التحضيرية
        </h1>
        <p className="max-w-[70ch] text-[length:var(--text-scale-4)] leading-relaxed text-ink/80">
          {getLessonsIntro(config.id)}
        </p>
      </div>

      <div className="flex flex-col gap-2 border border-ink/15 bg-paper-2 px-4 py-4">
        <p className="text-[length:var(--text-scale-4)]">
          أنهيت <span className="font-bold text-green-dk">{toArabicNumerals(String(done))}</span> من{" "}
          {toArabicNumerals(String(total))} درسًا.
        </p>
        <ProgressRule done={done} total={total} />
        <div className="mt-2 flex flex-wrap gap-2">
          {resume && (
            <Link
              to={`/${config.routeSegment}/lessons/${resume.id}`}
              className="border border-ink/40 px-3 py-1.5 text-[length:var(--text-scale-5)] hover:border-ink"
            >
              متابعة: {resume.title}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setPdfSheetOpen(true)}
            className="rounded-[2px] border border-ink/40 px-3 py-1.5 text-[length:var(--text-scale-5)] hover:border-ink"
          >
            تحميل الدروس PDF
          </button>
        </div>
      </div>

      {modules.map((module) => (
        <ModuleCard
          key={module.id}
          module={module}
          studiedIds={studiedIds}
          routeSegment={config.routeSegment}
        />
      ))}

      <LessonsPdfSheet open={pdfSheetOpen} onClose={() => setPdfSheetOpen(false)} config={config} />
    </div>
  );
}
