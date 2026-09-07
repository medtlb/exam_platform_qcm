import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function RequireAuth({ children }: { children: ReactNode }) {
  const unlocked = useAuthStore((s) => s.unlocked);

  if (!unlocked) return <Navigate to="/login" replace />;
  return children;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const unlocked = useAuthStore((s) => s.unlocked);

  if (unlocked) return <Navigate to="/" replace />;
  return children;
}
