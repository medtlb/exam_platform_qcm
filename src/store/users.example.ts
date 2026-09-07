import type { Track } from "../lib/types";

export type StaticUser = {
  username: string;
  name: string;
  salt: string;
  passwordHash: string;
  allowedTracks: "all" | Track[];
};

/**
 * Example user credentials template.
 * Copy this file to `users.ts` and set your own users and password hashes.
 */
export const USERS: StaticUser[] = [
  {
    username: "candidate",
    name: "Candidate Demo",
    salt: "b7e2c1a4f6d98035e21c4a7f0b3d6e91",
    passwordHash: "4d73ae5a6d5bfdcc4a6637f63706fa1cd5b470e6f2e7deb8b93407469ad8d0a4",
    allowedTracks: "all",
  },
];
