import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "../../components/Button";
import { buildAttempt } from "../../lib/scoring";
import type { TrackConfig } from "../../lib/trackConfig";
import { getExamStore, getProgressStore } from "../../lib/trackConfig";
import { useAuthStore } from "../../store/authStore";
import { getElapsedSeconds, getPausedSeconds } from "../../store/examStore";
import { CancelExamSheet } from "./CancelExamSheet";
import { QuestionCard } from "./QuestionCard";
import { QuestionGrid } from "./QuestionGrid";
import { SubmitSheet } from "./SubmitSheet";
import { Timer } from "./Timer";

export function ExamRunner() {
  const navigate = useNavigate();
  const config = useOutletContext<TrackConfig>();
  const useExamStore = getExamStore(config.id);
  const useProgressStore = getProgressStore(config.id);
  const candidateName = useAuthStore((s) => s.name);
  const questions = useExamStore((s) => s.questions);
  const answers = useExamStore((s) => s.answers);
  const currentIndex = useExamStore((s) => s.currentIndex);
  const goTo = useExamStore((s) => s.goTo);
  const toggleOption = useExamStore((s) => s.toggleOption);
  const resetExam = useExamStore((s) => s.reset);
  const addAttempt = useProgressStore((s) => s.addAttempt);
  const markSeen = useProgressStore((s) => s.markSeen);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [cancelSheetOpen, setCancelSheetOpen] = useState(false);

  const handleCancel = useCallback(() => {
    resetExam();
    navigate(`/${config.routeSegment}`, { replace: true });
  }, [resetExam, navigate, config]);

  const handleSubmit = useCallback(() => {
    const state = useExamStore.getState();
    const attempt = buildAttempt({
      id: crypto.randomUUID(),
      track: config.id,
      candidateName,
      date: new Date().toISOString(),
      timeUsedSeconds: getElapsedSeconds(state),
      pausedSeconds: getPausedSeconds(state),
      questions: state.questions,
      answers: state.answers,
      difficultyBreakdownSection: config.difficultyBreakdownSection,
    });
    addAttempt(attempt);
    markSeen(state.questions.map((q) => q.id));
    resetExam();
    navigate(`/${config.routeSegment}/results/${attempt.id}`, { replace: true });
  }, [config, candidateName, addAttempt, markSeen, resetExam, navigate, useExamStore]);

  useEffect(() => {
    // Guards direct navigation to /exam with no active session. Deliberately
    // mount-only: reacting to `status` here would race the navigate() call
    // in handleSubmit (which also flips status to "idle" via reset()) and
    // send the user back to the track home instead of the results page.
    if (useExamStore.getState().status !== "running") {
      navigate(`/${config.routeSegment}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = questions[currentIndex];

  useEffect(() => {
    if (!current) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        goTo(currentIndex + 1); // RTL: left arrow moves forward visually→next
      } else if (e.key === "ArrowRight") {
        goTo(currentIndex - 1);
      } else if (/^[1-7]$/.test(e.key)) {
        const optionIndex = Number(e.key) - 1;
        const option = current.options[optionIndex];
        if (option) toggleOption(current.id, option.id);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, currentIndex, goTo, toggleOption]);

  if (!current) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border border-ink/15 bg-paper-2 px-4 py-2">
        <Timer onExpire={handleSubmit} />
        <div className="flex items-center gap-2">
          <Button variant="danger" onClick={() => setCancelSheetOpen(true)}>
            إلغاء الاختبار
          </Button>
          <Button variant="secondary" onClick={() => setSheetOpen(true)}>
            تسليم الاختبار
          </Button>
        </div>
      </div>

      <QuestionGrid />

      <QuestionCard question={current} index={currentIndex} total={questions.length} />

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
          السابق
        </Button>
        <span className="text-[length:var(--text-scale-5)] text-ink/60">
          استخدم 1-7 لتحديد الخيارات، والأسهم للتنقل
        </span>
        <Button
          variant="secondary"
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex === questions.length - 1}
        >
          التالي
        </Button>
      </div>

      <SubmitSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onConfirm={handleSubmit} />
      <CancelExamSheet
        open={cancelSheetOpen}
        onClose={() => setCancelSheetOpen(false)}
        onConfirm={handleCancel}
      />

      <p className="sr-only" aria-live="polite">
        {answers[current.id]?.length ?? 0} خيار محدد
      </p>
    </div>
  );
}
