import { describe, expect, it } from "vitest";
import { scoreExam, scoreQuestion } from "./scoring";
import type { Question } from "./types";

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "gc-0001",
    track: "douanes",
    section: "general",
    topic: "test",
    difficulty: 1,
    lang: "ar",
    prompt: "prompt",
    options: [
      { id: "a", text: "a" },
      { id: "b", text: "b" },
      { id: "c", text: "c" },
      { id: "d", text: "d" },
      { id: "e", text: "e" },
      { id: "f", text: "f" },
    ],
    correct: ["a", "b"],
    explanation: "explanation",
    ...overrides,
  };
}

describe("scoreQuestion", () => {
  it("scores 1 when all correct options are selected and nothing wrong", () => {
    const q = makeQuestion({ correct: ["a", "b"] });
    expect(scoreQuestion(q, ["a", "b"])).toBe(1);
  });

  it("scores C_selected / C for a partial correct selection", () => {
    const q = makeQuestion({ correct: ["a", "b"] });
    expect(scoreQuestion(q, ["a"])).toBeCloseTo(0.5);
  });

  it("subtracts 1/W for a wrong tick, W=4", () => {
    // C=2 correct (a,b), W=4 wrong (c,d,e,f) -> one correct + one wrong = 0.5 - 0.25
    const q = makeQuestion({ correct: ["a", "b"] });
    expect(scoreQuestion(q, ["a", "c"])).toBeCloseTo(0.25);
  });

  it("floors a net-negative raw score to 0", () => {
    const q = makeQuestion({ correct: ["a", "b"] });
    expect(scoreQuestion(q, ["c", "d"])).toBe(0);
  });

  it("scores 0 for an empty selection", () => {
    const q = makeQuestion({ correct: ["a", "b"] });
    expect(scoreQuestion(q, [])).toBe(0);
  });

  it("scores 0 when every option is selected", () => {
    const q = makeQuestion({ correct: ["a", "b"] });
    const allIds = q.options.map((o) => o.id);
    expect(scoreQuestion(q, allIds)).toBe(0);
  });
});

describe("scoreExam", () => {
  it("computes mark20 as total/N*20 rounded to 2 decimals", () => {
    const questions = Array.from({ length: 60 }, (_, i) =>
      makeQuestion({ id: `gc-${i}`, correct: ["a", "b"] }),
    );
    const answers: Record<string, string[]> = {};
    for (const q of questions) answers[q.id] = ["a", "b"]; // full marks on every question

    const { total, mark20 } = scoreExam(questions, answers);
    expect(total).toBe(60);
    expect(mark20).toBe(20);
  });
});
