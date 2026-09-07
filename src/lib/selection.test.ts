import { describe, expect, it } from "vitest";
import { DEFAULT_COMPOSITION, SESSION_SIZE, buildExam } from "./selection";
import type { Question, Section } from "./types";

function makeBank(perSection: number): Question[] {
  const sections: Section[] = ["general", "arabic", "french"];
  const difficulties = [1, 2, 3, 4, 5] as const;
  const bank: Question[] = [];

  for (const section of sections) {
    for (let i = 0; i < perSection; i++) {
      const difficulty = difficulties[i % difficulties.length];
      bank.push({
        id: `${section}-${i}`,
        track: "douanes",
        section,
        topic: "test",
        difficulty,
        lang: section === "french" ? "fr" : "ar",
        prompt: `${section} prompt ${i}`,
        options: [
          { id: "a", text: "a" },
          { id: "b", text: "b" },
          { id: "c", text: "c" },
          { id: "d", text: "d" },
          { id: "e", text: "e" },
        ],
        correct: ["a"],
        explanation: "explanation",
      });
    }
  }

  return bank;
}

describe("buildExam", () => {
  it("splits the session 24/18/18", () => {
    const bank = makeBank(50);
    const exam = buildExam(bank, new Set());

    expect(exam).toHaveLength(SESSION_SIZE);
    expect(exam.filter((q) => q.section === "general")).toHaveLength(DEFAULT_COMPOSITION.general);
    expect(exam.filter((q) => q.section === "arabic")).toHaveLength(DEFAULT_COMPOSITION.arabic);
    expect(exam.filter((q) => q.section === "french")).toHaveLength(DEFAULT_COMPOSITION.french);
  });

  it("never repeats a question id within a session", () => {
    const bank = makeBank(50);
    const exam = buildExam(bank, new Set());
    const ids = exam.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never draws a seen id while unseen ones remain in that section", () => {
    const bank = makeBank(50);
    // mark all but 24/18/18 unseen items as seen, per section, so exactly
    // enough unseen items remain to fill the session without recycling.
    const seenIds = new Set<string>();
    for (const section of ["general", "arabic", "french"] as const) {
      const count = section === "general" ? DEFAULT_COMPOSITION.general : DEFAULT_COMPOSITION[section];
      const sectionIds = bank.filter((q) => q.section === section).map((q) => q.id);
      for (const id of sectionIds.slice(count)) seenIds.add(id);
    }

    const exam = buildExam(bank, seenIds);
    for (const q of exam) {
      expect(seenIds.has(q.id)).toBe(false);
    }
  });

  it("silently recycles least-recently-seen items when a section runs out of unseen", () => {
    const bank = makeBank(30); // enough items per section, but every one is seen
    const seenIds = new Set<string>();
    const lastSeenAt: Record<string, number> = {};
    bank.forEach((q, i) => {
      seenIds.add(q.id);
      lastSeenAt[q.id] = i;
    });

    const exam = buildExam(bank, seenIds, lastSeenAt);
    expect(exam).toHaveLength(SESSION_SIZE);
    expect(exam.filter((q) => q.section === "general")).toHaveLength(DEFAULT_COMPOSITION.general);
  });

  it("orders the french subset by ascending difficulty", () => {
    const bank = makeBank(50);
    const exam = buildExam(bank, new Set());
    const frenchDifficulties = exam.filter((q) => q.section === "french").map((q) => q.difficulty);
    const sorted = [...frenchDifficulties].sort((a, b) => a - b);
    expect(frenchDifficulties).toEqual(sorted);
  });
});
