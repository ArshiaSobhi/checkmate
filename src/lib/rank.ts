import { Rank } from "@prisma/client";
import { rankOrder } from "./utils";

export type RankChange =
  | { rank: Rank; points: number; change: number; promoted?: boolean; demoted?: boolean; reason: string };

export function applyRankChange(currentRank: Rank, currentPoints: number, result: "win" | "loss" | "draw"): RankChange {
  let points = currentPoints;
  if (result === "win") {
    points += 5;
  } else if (result === "loss") {
    points -= 5;
  }

  let rank = currentRank;
  let promoted = false;
  let demoted = false;

  const idx = rankOrder.indexOf(rank);

  if (points >= 100) {
    const nextIndex = Math.min(rankOrder.length - 1, idx + 1);
    promoted = nextIndex > idx;
    rank = rankOrder[nextIndex];
    points = 0;
  }

  if (points < 0) {
    const prevIndex = Math.max(0, idx - 1);
    demoted = prevIndex < idx;
    rank = rankOrder[prevIndex];
    points = 95;
  }

  return {
    rank,
    points,
    change: result === "win" ? 5 : result === "loss" ? -5 : 0,
    promoted,
    demoted,
    reason: result === "draw" ? "Draw" : result === "win" ? "Win" : "Loss",
  };
}
