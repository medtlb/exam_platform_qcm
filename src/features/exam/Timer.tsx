import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { TrackConfig } from "../../lib/trackConfig";
import { getExamStore } from "../../lib/trackConfig";
import { getRemainingSeconds } from "../../store/examStore";

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

type TimerProps = {
  onExpire: () => void;
};

export function Timer({ onExpire }: TimerProps) {
  const config = useOutletContext<TrackConfig>();
  const useExamStore = getExamStore(config.id);
  const paused = useExamStore((s) => s.paused);
  const pause = useExamStore((s) => s.pause);
  const resume = useExamStore((s) => s.resume);
  const [now, setNow] = useState(() => Date.now());
  const expiredRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = getRemainingSeconds(useExamStore.getState(), config.timerSeconds, now);

  useEffect(() => {
    if (remaining <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire();
    }
  }, [remaining, onExpire]);

  const low = remaining <= 5 * 60;

  return (
    <div className="flex items-center gap-3">
      <span
        className={[
          "font-kufi tabular-nums text-[length:var(--text-scale-3)] font-bold",
          low ? "text-stamp" : "text-ink",
        ].join(" ")}
        aria-live="polite"
      >
        {formatTime(remaining)}
      </span>
      <button
        type="button"
        onClick={() => (paused ? resume() : pause())}
        className="border border-ink/40 px-3 py-1 text-[length:var(--text-scale-5)] hover:border-ink"
      >
        {paused ? "استئناف" : "إيقاف مؤقت"}
      </button>
    </div>
  );
}
