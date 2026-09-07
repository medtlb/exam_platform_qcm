import type { Lesson, LessonModule } from "../lib/types";
import raw from "./lessons.json";

const payload = raw as unknown as { intro: string; modules: LessonModule[] };

export const lessonsIntro = payload.intro;
export const lessonModules = payload.modules;
export const allLessons: Lesson[] = lessonModules.flatMap((m) => m.lessons);

export function getLesson(id: string): Lesson | undefined {
  return allLessons.find((lesson) => lesson.id === id);
}

export function getModule(id: string): LessonModule | undefined {
  return lessonModules.find((module) => module.id === id);
}

/** Previous/next across the whole guide, so a lesson reads as one continuous course. */
export function getLessonNeighbours(id: string): { previous?: Lesson; next?: Lesson } {
  const index = allLessons.findIndex((lesson) => lesson.id === id);
  if (index === -1) return {};
  return { previous: allLessons[index - 1], next: allLessons[index + 1] };
}
