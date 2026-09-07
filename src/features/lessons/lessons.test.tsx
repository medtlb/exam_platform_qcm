import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, matchRoutes } from "react-router-dom";
import { beforeAll, describe, expect, it } from "vitest";
import { allLessons, getLesson, getLessonNeighbours, lessonModules } from "../../data/lessons";
import {
  tresorAllLessons,
  getTresorLesson,
  getTresorLessonNeighbours,
  tresorLessonModules,
} from "../../data/tresor/lessons";
import { TOPIC_SECTION } from "../../lib/bankTargets";
import { questionBank } from "../../data";
import { tresorQuestionBank } from "../../data/tresor";
import { InlineText } from "./InlineText";
import { router } from "../../app/router";
import { LessonScreen } from "./LessonScreen";
import { LessonsPrintView } from "./LessonsPrintView";
import { LessonsScreen } from "./LessonsScreen";
import { useDouanesLessonsStore } from "../../store/lessonsStore";

beforeAll(() => {
  // jsdom has no layout, so the reader's scroll-to-top on navigation throws.
  window.scrollTo = () => {};
});

describe("lesson bank", () => {
  it("has every module non-empty with unique lesson ids", () => {
    expect(lessonModules.length).toBeGreaterThan(0);
    for (const module of lessonModules) {
      expect(module.lessons.length).toBeGreaterThan(0);
    }
    const ids = allLessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only tags topics that exist in the question bank", () => {
    const bankTopics = new Set(questionBank.map((q) => q.topic));
    for (const lesson of allLessons) {
      expect(lesson.topics.length).toBeGreaterThan(0);
      for (const topic of lesson.topics) {
        expect(TOPIC_SECTION[topic]).toBeDefined();
        expect(bankTopics.has(topic)).toBe(true);
      }
    }
  });

  it("chains previous/next across module boundaries", () => {
    const first = allLessons[0];
    const last = allLessons[allLessons.length - 1];
    expect(getLessonNeighbours(first.id).previous).toBeUndefined();
    expect(getLessonNeighbours(last.id).next).toBeUndefined();

    const middle = allLessons[1];
    expect(getLessonNeighbours(middle.id).previous?.id).toBe(first.id);
    expect(getLesson(middle.id)?.title).toBe(middle.title);
  });
});

describe("tresor lesson bank", () => {
  it("has every module non-empty with unique lesson ids", () => {
    expect(tresorLessonModules.length).toBeGreaterThan(0);
    for (const module of tresorLessonModules) {
      expect(module.lessons.length).toBeGreaterThan(0);
    }
    const ids = tresorAllLessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only tags topics that exist in the tresor question bank", () => {
    // Tresor has no static topic->section registry (unlike Douanes'
    // TOPIC_SECTION in bankTargets.ts) — just check the topic string is
    // real, i.e. actually used by some question in that track's bank.
    const bankTopics = new Set(tresorQuestionBank.map((q) => q.topic));
    for (const lesson of tresorAllLessons) {
      expect(lesson.topics.length).toBeGreaterThan(0);
      for (const topic of lesson.topics) {
        expect(bankTopics.has(topic)).toBe(true);
      }
    }
  });

  it("chains previous/next across module boundaries", () => {
    const first = tresorAllLessons[0];
    const last = tresorAllLessons[tresorAllLessons.length - 1];
    expect(getTresorLessonNeighbours(first.id).previous).toBeUndefined();
    expect(getTresorLessonNeighbours(last.id).next).toBeUndefined();

    const middle = tresorAllLessons[1];
    expect(getTresorLessonNeighbours(middle.id).previous?.id).toBe(first.id);
    expect(getTresorLesson(middle.id)?.title).toBe(middle.title);
  });
});

describe("InlineText", () => {
  it("renders ** and * runs as emphasis instead of literal markers", () => {
    const { container } = render(<InlineText text="عمق **20 كم** من *الشاطئ*" />);
    expect(container.querySelector("strong")?.textContent).toBe("20 كم");
    expect(container.querySelector("em")?.textContent).toBe("الشاطئ");
    expect(container.textContent).not.toContain("*");
  });
});

function renderLesson(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/douanes/lessons/${id}`]}>
      <Routes>
        <Route path="/douanes/lessons/:lessonId" element={<LessonScreen />} />
        <Route path="/douanes/lessons" element={<p>الفهرس</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LessonScreen", () => {
  it("renders a lesson with its nested points and topic tags", () => {
    renderLesson("m1-l1");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("المهام والرقابة");
    expect(screen.getByText("الجمارك والتجارة")).toBeDefined();
    // nested sub-point of "الدائرة الجمركية"
    expect(screen.getByText(/منطقة بحرية/)).toBeDefined();
  });

  it("renders the Incoterms table with one row per term", () => {
    renderLesson("m2-l2");
    const table = screen.getByRole("table");
    expect(within(table).getByText("EXW")).toBeDefined();
    expect(within(table).getAllByRole("row").length).toBe(7); // header + 6 terms
  });

  it("marks a French lesson LTR", () => {
    const { container } = renderLesson("m5-l1");
    expect(container.querySelector("h1")?.getAttribute("dir")).toBe("ltr");
  });

  it("redirects an unknown lesson id back to the index", () => {
    renderLesson("nope");
    expect(screen.getByText("الفهرس")).toBeDefined();
  });
});

describe("LessonsScreen", () => {
  it("lists every module and lesson with a zeroed progress rule", () => {
    // The reader tests above left a "resume" pointer in the persisted store.
    useDouanesLessonsStore.getState().resetLessonProgress();

    render(
      <MemoryRouter>
        <LessonsScreen />
      </MemoryRouter>,
    );

    for (const module of lessonModules) {
      expect(screen.getByRole("heading", { name: module.title })).toBeDefined();
    }
    // one link per lesson, plus one "PDF" link per module header
    expect(screen.getAllByRole("link").length).toBe(allLessons.length + lessonModules.length);

    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuemax")).toBe(String(allLessons.length));
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
  });
});

function renderPrintView(scope: string, track = "douanes") {
  return render(
    <MemoryRouter initialEntries={[`/${track}/lessons/print?module=${scope}`]}>
      <Routes>
        <Route path="/:track/lessons/print" element={<LessonsPrintView />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("lessons PDF export", () => {
  it("routes /douanes/lessons/print to the print view, not the lesson reader", () => {
    const matches = matchRoutes(router.routes, "/douanes/lessons/print");
    const leaf = matches?.[matches.length - 1]?.route.element;
    expect(leaf).toBeDefined();
    expect((leaf as { type: unknown }).type).toBe(LessonsPrintView);
  });

  it("routes /tresor/lessons/print to the print view, not the lesson reader", () => {
    const matches = matchRoutes(router.routes, "/tresor/lessons/print");
    const leaf = matches?.[matches.length - 1]?.route.element;
    expect(leaf).toBeDefined();
    expect((leaf as { type: unknown }).type).toBe(LessonsPrintView);
  });

  it("renders every tresor lesson for the tresor track's full guide", () => {
    const { container } = renderPrintView("all", "tresor");
    for (const lesson of tresorAllLessons) {
      expect(screen.getAllByText(lesson.title).length).toBeGreaterThan(0);
    }
    expect(container.querySelectorAll(".pdf-block").length).toBeGreaterThan(tresorAllLessons.length);
  });

  it("renders every lesson of every module for the full guide", () => {
    const { container } = renderPrintView("all");
    for (const lesson of allLessons) {
      expect(screen.getAllByText(lesson.title).length).toBeGreaterThan(0);
    }
    // Each top-level point is its own pagination block for the direct download.
    expect(container.querySelectorAll(".pdf-block").length).toBeGreaterThan(allLessons.length);
  });

  it("renders only the requested module", () => {
    const [first, second] = lessonModules;
    renderPrintView(second.id);
    expect(screen.getAllByText(second.lessons[0].title).length).toBeGreaterThan(0);
    expect(screen.queryByText(first.lessons[0].title)).toBeNull();
  });

  it("reports an unknown module instead of exporting an empty file", () => {
    renderPrintView("m99");
    expect(screen.getByText(/لم يتم العثور على هذه الوحدة/)).toBeDefined();
  });
});
