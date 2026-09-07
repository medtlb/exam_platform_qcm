import { describe, expect, it } from "vitest";
import { findDuplicatePrompts, normalizeText, validateQuestion } from "./validate";
import type { Question } from "./types";

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "gc-0001",
    track: "douanes",
    section: "general",
    topic: "test",
    difficulty: 1,
    lang: "ar",
    prompt: "ما هي عاصمة موريتانيا؟",
    options: [
      { id: "a", text: "نواكشوط" },
      { id: "b", text: "روصو" },
      { id: "c", text: "كيفة" },
      { id: "d", text: "ألاك" },
      { id: "e", text: "أطار" },
    ],
    correct: ["a"],
    explanation: "نواكشوط هي عاصمة موريتانيا.",
    ...overrides,
  };
}

describe("normalizeText", () => {
  it("strips Arabic diacritics so vocalized and unvocalized text match", () => {
    expect(normalizeText("مَاذَا")).toBe(normalizeText("ماذا"));
  });

  it("strips punctuation and collapses whitespace", () => {
    expect(normalizeText("ما هي، عاصمة  موريتانيا؟")).toBe(normalizeText("ما هي عاصمة موريتانيا"));
  });
});

describe("validateQuestion", () => {
  it("accepts a well-formed question", () => {
    expect(validateQuestion(makeQuestion())).toEqual([]);
  });

  it("rejects fewer than 5 options", () => {
    const q = makeQuestion({ options: makeQuestion().options.slice(0, 4) });
    expect(validateQuestion(q).some((e) => e.includes("fewer than 5"))).toBe(true);
  });

  it("rejects an empty correct array", () => {
    const q = makeQuestion({ correct: [] });
    expect(validateQuestion(q).some((e) => e.includes("empty correct array"))).toBe(true);
  });

  it("rejects a correct array covering every option", () => {
    const q = makeQuestion();
    const q2 = makeQuestion({ correct: q.options.map((o) => o.id) });
    expect(validateQuestion(q2).some((e) => e.includes("covers every option"))).toBe(true);
  });

  it("rejects a missing explanation", () => {
    const q = makeQuestion({ explanation: "" });
    expect(validateQuestion(q).some((e) => e.includes("missing explanation"))).toBe(true);
  });
});

describe("findDuplicatePrompts", () => {
  it("flags near-duplicate prompts that only differ by diacritics/punctuation", () => {
    const bank = [
      makeQuestion({ id: "gc-0001", prompt: "ما هي عاصمة موريتانيا؟" }),
      makeQuestion({ id: "gc-0002", prompt: "ما هي عاصمة موريتانيا" }),
    ];
    const groups = findDuplicatePrompts(bank);
    expect(groups).toHaveLength(1);
    expect(groups[0].ids.sort()).toEqual(["gc-0001", "gc-0002"]);
  });
});
