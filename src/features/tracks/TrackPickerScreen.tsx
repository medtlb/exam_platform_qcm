import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { trackConfigs } from "../../lib/trackConfig";

export function TrackPickerScreen() {
  const name = useAuthStore((s) => s.name);
  const allowedTracks = useAuthStore((s) => s.allowedTracks);
  const configs = Object.values(trackConfigs).filter(
    (c) => allowedTracks === "all" || allowedTracks.includes(c.id),
  );

  // A single-track user has nothing to pick — go straight to their exam.
  if (configs.length === 1) return <Navigate to={`/${configs[0].routeSegment}`} replace />;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-kufi text-[length:var(--text-scale-2)] font-bold text-green-dk">
          أهلاً {name}
        </h1>
        <p className="max-w-md text-[length:var(--text-scale-4)] text-ink/80">
          اختر المسابقة التي تريد التدرب عليها
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {configs.map((config) => (
          <Link
            key={config.id}
            to={`/${config.routeSegment}`}
            data-track={config.id}
            className="flex flex-col items-center gap-3 border border-ink/15 bg-paper-2 px-6 py-8 text-center transition-colors hover:border-ink/40"
          >
            <img src={config.emblemSrc} alt="" className="h-14 w-14 object-contain" />
            <span className="font-kufi text-[length:var(--text-scale-3)] font-bold text-green-dk">
              {config.homeTitle}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
