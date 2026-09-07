import { Navigate, Outlet, useParams } from "react-router-dom";
import { getTrackConfig } from "../lib/trackConfig";
import { useAuthStore } from "../store/authStore";

/**
 * Validates the `:track` route param and exposes the resolved TrackConfig to
 * every descendant via `useOutletContext<TrackConfig>()`. Keyed on `track`
 * so the whole subtree remounts on a track switch — required because
 * descendants pick a different zustand store hook per track (see
 * `getExamStore`/`getProgressStore`), and hooks must stay stable across
 * renders of the same component instance.
 *
 * Also enforces the logged-in user's track permissions here (not just in
 * the track picker's UI) so a disallowed track can't be reached by typing
 * its URL directly.
 */
export function TrackRoute() {
  const { track } = useParams<{ track: string }>();
  const config = getTrackConfig(track);
  const canAccessTrack = useAuthStore((s) => s.canAccessTrack);

  if (!config || !canAccessTrack(config.id)) return <Navigate to="/" replace />;

  return <Outlet key={track} context={config} />;
}
