import { create } from "zustand";
import { verifyPassword } from "../lib/auth";
import type { Track } from "../lib/types";

import { USERS } from "./users";

type AuthState = {
  unlocked: boolean;
  username: string;
  name: string;
  allowedTracks: "all" | Track[];
  login: (username: string, password: string) => Promise<boolean>;
  lock: () => void;
  canAccessTrack: (track: Track) => boolean;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  unlocked: false,
  username: "",
  name: "",
  allowedTracks: [],

  async login(username, password) {
    const user = USERS.find((u) => u.username === username);
    if (!user) return false;
    const ok = await verifyPassword(password, user.salt, user.passwordHash);
    if (ok) {
      set({ unlocked: true, username: user.username, name: user.name, allowedTracks: user.allowedTracks });
    }
    return ok;
  },

  lock() {
    set({ unlocked: false, username: "", name: "", allowedTracks: [] });
  },

  canAccessTrack(track) {
    const { allowedTracks } = get();
    return allowedTracks === "all" || allowedTracks.includes(track);
  },
}));
