import type { UserRow } from "./db/sqlite";

export type PublicUser = {
  id: number;
  name: string;
  color: string;
  emoji: string;
  grade: number;
  username: string | null;
  hasLogin: boolean;
  coins: number;
};

export function publicUser(u: UserRow): PublicUser {
  return {
    id: u.id,
    name: u.name,
    color: u.color,
    emoji: u.emoji,
    grade: u.grade,
    username: u.username ?? null,
    hasLogin: Boolean(u.username && u.password_hash),
    coins: u.coins ?? 0,
  };
}
