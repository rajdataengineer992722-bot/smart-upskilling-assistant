import { api } from "@/api/client";
import type { Badge, LeaderboardEntry } from "@/types";

export async function getBadges() {
  const { data } = await api.get<{ badges: Badge[] }>("/badges");
  return data.badges;
}

export async function getLeaderboard() {
  const { data } = await api.get<{ leaderboard: LeaderboardEntry[] }>("/leaderboard");
  return data.leaderboard;
}
