"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Chess } from "chess.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMs } from "@/lib/utils";
import { toast } from "sonner";

const Chessboard = dynamic(() => import("react-chessboard").then((m) => m.Chessboard), {
  ssr: false,
});

type GameClientProps = {
  gameId: string;
  currentUserId: string;
  initial: any;
  initialMoves: any[];
};

export function GameClient({ gameId, currentUserId, initial, initialMoves }: GameClientProps) {
  const { data, mutate } = useSWR(`/api/games/${gameId}`, (url) => fetch(url).then((r) => r.json()), {
    refreshInterval: 3000,
    fallbackData: { game: initial, moves: initialMoves },
  });
  const [pending, setPending] = useState(false);

  const [viewIndex, setViewIndex] = useState((data?.moves ?? []).length);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setViewIndex((data?.moves ?? []).length);
  }, [data?.moves?.length]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setViewIndex((idx: number) => {
        const max = (data?.moves ?? []).length;
        if (idx >= max) {
          setPlaying(false);
          return idx;
        }
        return idx + 1;
      });
    }, 1200);
    return () => clearInterval(id);
  }, [playing, data?.moves]);

  const chess = useMemo(() => {
    const c = new Chess();
    (data?.moves ?? []).slice(0, viewIndex).forEach((m: any) => c.move(m.san));
    return c;
  }, [data, viewIndex]);

  const handleDrop = async (source: string, target: string, piece?: string) => {
    if (pending) return;
    setPending(true);
    if (viewIndex !== (data?.moves ?? []).length) {
      toast.error("Jump to the latest move to play.");
      setPending(false);
      return;
    }
    const res = await fetch(`/api/games/${gameId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: source, to: target, promotion: piece?.toLowerCase().includes("p") ? "q" : undefined }),
    });
    setPending(false);
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      toast.error(payload.error ?? "Illegal move");
      return;
    }
    mutate();
  };

  const game = data?.game;
  if (!game) return null;

  const toMove = chess.turn();
  const elapsed = game.lastMoveAt ? Date.now() - new Date(game.lastMoveAt).getTime() : 0;
  const clockWhite = toMove === "w" ? game.clockWhiteMs - elapsed : game.clockWhiteMs;
  const clockBlack = toMove === "b" ? game.clockBlackMs - elapsed : game.clockBlackMs;

  const resign = async () => {
    await fetch(`/api/games/${gameId}/resign`, { method: "POST" });
    mutate();
  };

  const draw = async () => {
    const res = await fetch(`/api/games/${gameId}/draw`, { method: "POST" });
    if (res.ok) {
      const payload = await res.json();
      toast.success(payload.status === "OFFERED" ? "Draw offered" : "Game drawn");
      mutate();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="bg-slate-900/70">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-slate-300">White</p>
            <p className="font-semibold">{game.whiteId === currentUserId ? "You" : game.white.username}</p>
            <p className="text-lg font-semibold text-white">{formatMs(clockWhite)}</p>
          </div>
          <div className="text-sm text-slate-300">
            {game.mode} · {game.timeControl}
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-300">Black</p>
            <p className="font-semibold">{game.blackId === currentUserId ? "You" : game.black.username}</p>
            <p className="text-lg font-semibold text-white">{formatMs(clockBlack)}</p>
          </div>
        </div>
        <div className="p-4">
          <Chessboard
            position={chess.fen()}
            onPieceDrop={(source, target, piece) => {
              void handleDrop(source, target, piece);
              return true;
            }}
            boardWidth={520}
            boardOrientation={game.whiteId === currentUserId ? "white" : "black"}
            arePiecesDraggable={game.status === "ONGOING"}
            customBoardStyle={{ borderRadius: "18px", boxShadow: "0 25px 80px rgba(0,0,0,0.35)" }}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="danger" onClick={resign} disabled={game.status !== "ONGOING"}>
              Resign
            </Button>
            <Button variant="secondary" onClick={draw} disabled={game.status !== "ONGOING"}>
              Offer draw
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setViewIndex(0)}>
                ⏮ First
              </Button>
              <Button variant="ghost" onClick={() => setViewIndex((v: number) => Math.max(0, v - 1))}>
                ◀ Prev
              </Button>
              <Button variant="ghost" onClick={() => setViewIndex((v: number) => Math.min((data?.moves ?? []).length, v + 1))}>
                Next ▶
              </Button>
              <Button variant="ghost" onClick={() => setViewIndex((data?.moves ?? []).length)}>
                Last ⏭
              </Button>
              <Button variant="ghost" onClick={() => setPlaying((p) => !p)}>
                {playing ? "Pause" : "Auto-play"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
      <div className="space-y-4">
        <Card title="Moves" className="bg-slate-900/70">
          <div className="max-h-96 overflow-y-auto text-sm text-slate-200">
            <ol className="grid grid-cols-2 gap-2">
              {data?.moves?.map((m: any, idx: number) => (
                <li key={m.id} className="rounded-lg bg-white/5 px-3 py-2">
                  {idx + 1}. {m.san}
                </li>
              ))}
            </ol>
          </div>
        </Card>
        <Card title="Status" className="bg-slate-900/70">
          <p className="text-slate-300">
            {game.status === "FINISHED"
              ? game.result === "DRAW"
                ? "Draw"
                : `Winner: ${game.winnerId === currentUserId ? "You" : game.winnerId === game.whiteId ? game.white.username : game.black.username}`
              : "In progress"}
          </p>
          {game.pgn && (
            <Button
              variant="ghost"
              className="mt-3"
              onClick={() => {
                navigator.clipboard.writeText(game.pgn ?? "");
                toast.success("PGN copied");
              }}
            >
              Copy PGN
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
