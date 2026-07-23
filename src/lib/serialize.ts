import type { UserRow } from "./db/sqlite";

export type PublicUser = {
  id: number;
  name: string;
  color: string;
  emoji: string;
  grade: number;
  hasPin: boolean;
};

export function publicUser(u: UserRow): PublicUser {
  return {
    id: u.id,
    name: u.name,
    color: u.color,
    emoji: u.emoji,
    grade: u.grade,
    hasPin: Boolean(u.pin_hash),
  };
}
