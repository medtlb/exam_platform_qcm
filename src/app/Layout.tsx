import { useEffect } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getTrackConfig } from "../lib/trackConfig";
import { assetUrl } from "../lib/assets";

export function Layout() {
  const unlocked = useAuthStore((s) => s.unlocked);
  const lock = useAuthStore((s) => s.lock);
  const { track } = useParams<{ track?: string }>();
  const config = getTrackConfig(track);

  const emblemSrc = config?.emblemSrc ?? assetUrl("emblem.png");
  const title = config?.homeTitle ?? "منصة تدريب على مباريات التوظيف";

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) {
      link.href = emblemSrc;
      link.type = emblemSrc.endsWith(".svg")
        ? "image/svg+xml"
        : emblemSrc.endsWith(".jpg") || emblemSrc.endsWith(".jpeg")
          ? "image/jpeg"
          : "image/png";
    }
    document.title = title;
  }, [emblemSrc, title]);

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink" data-track={config?.id}>
      <header className="flex items-center justify-between border-b border-ink/15 bg-green-dk px-4 py-3 text-paper-2 sm:px-8">
        <div className="flex items-center gap-3">
          <img src={emblemSrc} alt="" className="h-10 w-10 object-contain" />
          <span className="font-kufi text-[length:var(--text-scale-4)] font-bold">{title}</span>
        </div>
        {unlocked && (
          <nav className="flex items-center gap-4 text-[length:var(--text-scale-5)]">
            {config && (
              <>
                <Link to="/" className="hover:text-brass">
                  المسابقات
                </Link>
                {config.hasLessons && (
                  <Link to={`/${config.routeSegment}/lessons`} className="hover:text-brass">
                    الدروس
                  </Link>
                )}
                <Link to={`/${config.routeSegment}/history`} className="hover:text-brass">
                  السجل
                </Link>
                <Link to={`/${config.routeSegment}/settings`} className="hover:text-brass">
                  الإعدادات
                </Link>
              </>
            )}
            <button onClick={lock} className="hover:text-brass">
              قفل
            </button>
          </nav>
        )}
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
