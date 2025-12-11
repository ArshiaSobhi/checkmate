import { GameResult, GameStatus, Rank } from "@prisma/client";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<string | undefined | false | null>) {
  return twMerge(clsx(inputs));
}

export const timeControls = [
  { label: "3+2 Blitz", value: "3+2", initialMs: 3 * 60 * 1000, incrementMs: 2000 },
  { label: "5+0 Blitz", value: "5+0", initialMs: 5 * 60 * 1000, incrementMs: 0 },
  { label: "10+0 Rapid", value: "10+0", initialMs: 10 * 60 * 1000, incrementMs: 0 },
];

export function getTimeControlConfig(value: string) {
  const found = timeControls.find((t) => t.value === value);
  return (
    found ?? {
      label: value,
      value,
      initialMs: 5 * 60 * 1000,
      incrementMs: 0,
    }
  );
}

export function formatMs(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function friendlyDate(date: string | Date | null | undefined) {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString();
}

export const rankOrder: Rank[] = [
  Rank.BRONZE,
  Rank.SILVER,
  Rank.GOLD,
  Rank.PLATINUM,
  Rank.DIAMOND,
  Rank.GRANDMASTER,
];

export function rankProgress(points: number) {
  return Math.min(100, Math.max(0, points));
}

export function gameResultLabel(result: GameResult | null | undefined) {
  if (!result) return "In progress";
  switch (result) {
    case GameResult.WHITE_WIN:
      return "White wins";
    case GameResult.BLACK_WIN:
      return "Black wins";
    case GameResult.DRAW:
      return "Draw";
    case GameResult.ABORTED:
      return "Aborted";
    default:
      return "Result pending";
  }
}

export function isFinished(status: GameStatus) {
  return status === "FINISHED" || status === "ABORTED";
}
