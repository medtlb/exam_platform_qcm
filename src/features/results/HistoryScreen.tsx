import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { formatArabicNumber } from "../../lib/format";
import type { TrackConfig } from "../../lib/trackConfig";
import { getProgressStore } from "../../lib/trackConfig";
import { PdfExportSheet } from "./PdfExportSheet";

function MarksSparkline({ marks }: { marks: number[] }) {
  if (marks.length < 2) return null;
  const width = 240;
  const height = 48;
  const max = 20;
  const step = width / (marks.length - 1);
  const points = marks
    .map((m, i) => `${i * step},${height - (m / max) * height}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-full max-w-60" aria-hidden="true">
      <polyline points={points} fill="none" stroke="var(--color-green)" strokeWidth="2" />
      {marks.map((m, i) => (
        <circle key={i} cx={i * step} cy={height - (m / max) * height} r="2.5" fill="var(--color-brass)" />
      ))}
    </svg>
  );
}

export function HistoryScreen() {
  const config = useOutletContext<TrackConfig>();
  const useProgressStore = getProgressStore(config.id);
  const attempts = useProgressStore((s) => s.attempts);
  const [pdfAttemptId, setPdfAttemptId] = useState<string | null>(null);

  const marks = attempts.map((a) => a.mark20);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="font-kufi text-[length:var(--text-scale-2)] font-bold text-green-dk">سجل المحاولات</h1>

      {attempts.length === 0 ? (
        <p className="text-ink/70">لا توجد محاولات سابقة بعد.</p>
      ) : (
        <>
          <div className="flex flex-col items-start gap-2 border border-ink/15 bg-paper-2 px-4 py-4">
            <span className="text-[length:var(--text-scale-5)] text-ink/60">تطور العلامات عبر الزمن</span>
            <MarksSparkline marks={marks} />
          </div>

          <div className="flex flex-col gap-2">
            {[...attempts].reverse().map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between border border-ink/15 bg-paper-2 px-4 py-3"
              >
                <div>
                  <p className="text-[length:var(--text-scale-4)]">
                    {new Date(attempt.date).toLocaleDateString("ar")}
                  </p>
                  <p className="font-bold text-green-dk">{formatArabicNumber(attempt.mark20)} / ٢٠</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/${config.routeSegment}/results/${attempt.id}`}
                    className="border border-ink/40 px-3 py-1.5 text-[length:var(--text-scale-5)] hover:border-ink"
                  >
                    التفاصيل
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPdfAttemptId(attempt.id)}
                    className="border border-ink/40 px-3 py-1.5 text-[length:var(--text-scale-5)] hover:border-ink"
                  >
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <PdfExportSheet
        open={pdfAttemptId !== null}
        onClose={() => setPdfAttemptId(null)}
        attemptId={pdfAttemptId ?? ""}
      />
    </div>
  );
}
