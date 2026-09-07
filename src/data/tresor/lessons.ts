import type { Lesson, LessonModule } from "../../lib/types";
import raw from "./lessons.json";

const payload = raw as unknown as { intro: string; modules: LessonModule[] };

export const tresorLessonsIntro = payload.intro;
export const tresorLessonModules = payload.modules;
export const tresorAllLessons: Lesson[] = tresorLessonModules.flatMap((m) => m.lessons);

export function getTresorLesson(id: string): Lesson | undefined {
  return tresorAllLessons.find((lesson) => lesson.id === id);
}

export function getTresorModule(id: string): LessonModule | undefined {
  return tresorLessonModules.find((module) => module.id === id);
}

export function getTresorLessonNeighbours(id: string): { previous?: Lesson; next?: Lesson } {
  const index = tresorAllLessons.findIndex((lesson) => lesson.id === id);
  if (index === -1) return {};
  return { previous: tresorAllLessons[index - 1], next: tresorAllLessons[index + 1] };
}
