import type { Track } from "../lib/types";

export type StaticUser = {
  username: string;
  name: string;
  salt: string;
  passwordHash: string;
  allowedTracks: "all" | Track[];
};

/**
 * Template only — every credential below is a throwaway placeholder.
 *
 * The real accounts live in `users.ts`, which is gitignored and injected at
 * build time from the `USERS_TS` repository secret (see
 * `.github/workflows/deploy.yml`). To work on this locally, copy this file to
 * `users.ts` and replace the entries with your own.
 *
 * To generate a salt/hash pair, run `hashPassword(password)` from `../lib/auth`
 * — it returns `{ hash, salt }`. Never commit a real hash here.
 *
 * Note: this is a fully client-side app, so whatever ships in `users.ts` ends
 * up readable in the built JS bundle. These accounts gate which exam a person
 * sees; they are not a security boundary.
 */
export const USERS: StaticUser[] = [
  {
    // password: "changeme"
    username: "demo-admin",
    name: "Demo Admin",
    salt: "0a1b2c3d4e5f60718293a4b5c6d7e8f9",
    passwordHash: "46d613ed2b3b90a90c2409cad5b34ed795916f968eacb8cce75ab4718df2f648",
    allowedTracks: "all",
  },
  {
    // password: "changeme-too" — example of a single-track account
    username: "demo-tresor",
    name: "Demo Trésor",
    salt: "9f8e7d6c5b4a39281706f5e4d3c2b1a0",
    passwordHash: "34794d110baeec08b027e86dfe6f4cf77be42277146be35512ae26fc722aaf67",
    allowedTracks: ["tresor"],
  },
];
