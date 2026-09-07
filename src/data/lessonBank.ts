import type { Lesson, LessonModule, Track } from "../lib/types";
import { allLessons, getLesson, getLessonNeighbours, getModule, lessonModules, lessonsIntro } from "./lessons";
import {
  getTresorLesson,
  getTresorLessonNeighbours,
  getTresorModule,
  tresorAllLessons,
  tresorLessonModules,
  tresorLessonsIntro,
} from "./tresor/lessons";

export function getLessonsIntro(track: Track): string {
  return track === "tresor" ? tresorLessonsIntro : lessonsIntro;
}

export function getLessonModules(track: Track): LessonModule[] {
  return track === "tresor" ? tresorLessonModules : lessonModules;
}

export function getAllLessons(track: Track): Lesson[] {
  return track === "tresor" ? tresorAllLessons : allLessons;
}

export function getLessonByTrack(track: Track, id: string): Lesson | undefined {
  return track === "tresor" ? getTresorLesson(id) : getLesson(id);
}

export function getModuleByTrack(track: Track, id: string): LessonModule | undefined {
  return track === "tresor" ? getTresorModule(id) : getModule(id);
}

export function getLessonNeighboursByTrack(
  track: Track,
  id: string,
): { previous?: Lesson; next?: Lesson } {
  return track === "tresor" ? getTresorLessonNeighbours(id) : getLessonNeighbours(id);
}
