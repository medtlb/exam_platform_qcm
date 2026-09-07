import type { Question, Track } from "../lib/types";
import { questionBank as douanesQuestionBank } from "./index";
import { tresorQuestionBank } from "./tresor";

export function getQuestionBank(track: Track): Question[] {
  return track === "tresor" ? tresorQuestionBank : douanesQuestionBank;
}
