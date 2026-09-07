import type { Question } from "../lib/types";
import raw from "./questions.json";

export const questionBank = raw as unknown as Question[];
