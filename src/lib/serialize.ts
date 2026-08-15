import type { UserRow } from "./db/sqlite";
import type { RewardPackageRow, RewardRequestRow, RewardRequestWithChild } from "./db/repo";

export type PublicUser = {
  id: number;
  name: string;
  color: string;
  emoji: string;
  grade: number;
  username: string | null;
  hasLogin: boolean;
  coins: number;
  lastLoginAt: number | null;
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
    lastLoginAt: u.last_login_at ?? null,
  };
}

export type PublicRewardPackage = {
  id: number;
  minutes: number;
  coins: number;
  active: boolean;
};

export function publicRewardPackage(p: RewardPackageRow): PublicRewardPackage {
  return { id: p.id, minutes: p.minutes, coins: p.coins, active: Boolean(p.active) };
}

export type PublicRewardRequest = {
  id: number;
  userId: number;
  userName?: string;
  emoji?: string;
  color?: string;
  minutes: number;
  coins: number;
  status: "pending" | "approved" | "declined";
  createdAt: number;
  decidedAt: number | null;
};

export function publicRewardRequest(
  r: RewardRequestRow | RewardRequestWithChild,
): PublicRewardRequest {
  const withChild = r as RewardRequestWithChild;
  return {
    id: r.id,
    userId: r.user_id,
    userName: withChild.user_name,
    emoji: withChild.emoji,
    color: withChild.color,
    minutes: r.minutes,
    coins: r.coins,
    status: r.status,
    createdAt: r.created_at,
    decidedAt: r.decided_at,
  };
}
