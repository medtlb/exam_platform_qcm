import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Checkbox } from "../../components/Checkbox";
import { getLessonByTrack, getLessonNeighboursByTrack, getModuleByTrack } from "../../data/lessonBank";
import { toArabicNumerals } from "../../lib/format";
import { getLessonsStore, getTrackConfig, trackConfigs } from "../../lib/trackConfig";
import type { Track } from "../../lib/types";
import { LessonBlocks } from "./LessonBlocks";

export function LessonScreen() {
  const { lessonId = "", track: trackParam } = useParams();
  const config = getTrackConfig(trackParam) ?? trackConfigs.douanes;
  const useLessonsStore = getLessonsStore(config.id as Track);
  const lesson = getLessonByTrack(config.id, lessonId);
  const studiedIds = useLessonsStore((s) => s.studiedIds);
  const setStudied = useLessonsStore((s) => s.setStudied);
  const markOpened = useLessonsStore((s) => s.markOpened);

  useEffect(() => {
    if (lesson) markOpened(lesson.id);
  }, [lesson, markOpened]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId]);

  if (!config.hasLessons) return <Navigate to={`/${config.routeSegment}`} replace />;
  if (!lesson) return <Navigate to={`/${config.routeSegment}/lessons`} replace />;

  const module = getModuleByTrack(config.id, lesson.moduleId);
  const { previous, next } = getLessonNeighboursByTrack(config.id, lesson.id);
  const studied = studiedIds.includes(lesson.id);
  const isFrench = lesson.lang === "fr";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <nav className="text-[length:var(--text-scale-5)] text-ink/60">
        <Link to={`/${config.routeSegment}/lessons`} className="hover:text-green-dk">
          الدروس التحضيرية
        </Link>
        {module && <span> ‏/ {module.title}</span>}
      </nav>

      <article className="border border-ink/15 bg-paper-2 px-4 py-6 sm:px-8 sm:py-8">
        <header className="border-b border-brass pb-4">
          <p className="font-latin text-[length:var(--text-scale-5)] tabular-nums text-brass">
            الدرس {toArabicNumerals(String(lesson.order))}
          </p>
          <h1
            className="mt-1 font-kufi text-[length:var(--text-scale-2)] font-bold text-green-dk"
            dir={isFrench ? "ltr" : undefined}
            style={isFrench ? { textAlign: "start" } : undefined}
          >
            {lesson.title}
          </h1>
          {lesson.topics.length > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-[length:var(--text-scale-5)] text-ink/60">
              <span>يُحضّر لأسئلة:</span>
              {lesson.topics.map((topic) => (
                <span
                  key={topic}
                  dir={isFrench ? "ltr" : undefined}
                  className="border border-ink/25 px-2 py-0.5 text-ink/75"
                >
                  {topic}
                </span>
              ))}
            </p>
          )}
        </header>

        <div className="mt-6" dir={isFrench ? "ltr" : undefined}>
          <LessonBlocks blocks={lesson.blocks} />
        </div>
      </article>

      <div className="flex flex-wrap items-center justify-between gap-4 border border-ink/15 bg-paper-2 px-4 py-4">
        <Checkbox
          label="درستُ هذا الدرس"
          checked={studied}
          onChange={() => setStudied(lesson.id, !studied)}
        />
        <Link
          to={`/${config.routeSegment}/lessons/print?module=${lesson.moduleId}`}
          className="shrink-0 border border-ink/40 px-3 py-1.5 text-[length:var(--text-scale-5)] hover:border-ink"
        >
          تحميل الوحدة PDF
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3">
        {previous ? (
          <Link
            to={`/${config.routeSegment}/lessons/${previous.id}`}
            className="max-w-[45%] truncate border border-ink/40 px-3 py-1.5 text-[length:var(--text-scale-5)] hover:border-ink"
          >
            السابق: {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/${config.routeSegment}/lessons/${next.id}`}
            className="max-w-[45%] truncate border border-ink/40 px-3 py-1.5 text-[length:var(--text-scale-5)] hover:border-ink"
          >
            التالي: {next.title}
          </Link>
        ) : (
          <Link
            to={`/${config.routeSegment}`}
            className="border border-ink/40 px-3 py-1.5 text-[length:var(--text-scale-5)] hover:border-ink"
          >
            انتهت الدروس — ابدأ اختبارًا
          </Link>
        )}
      </div>
    </div>
  );
}
