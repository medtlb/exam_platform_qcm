import type { Question } from "../../lib/types";
import raw from "./questions.json";

export const tresorQuestionBank = raw as unknown as Question[];
