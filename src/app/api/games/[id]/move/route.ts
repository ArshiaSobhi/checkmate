import { NextResponse } from "next/server";
import { Chess } from "chess.js";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyRankChange } from "@/lib/rank";
import { moveSchema } from "@/lib/validators";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const game = await prisma.game.findUnique({
    where: { id },
    include: { moves: { orderBy: { moveIndex: "asc" } } },
  });

  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (![game.whiteId, game.blackId].includes(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (game.status !== "ONGOING") {
    return NextResponse.json({ error: "Game finished" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = moveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const chess = new Chess();
  for (const mv of game.moves) {
    chess.move(mv.san);
  }

  const turn = chess.turn(); // "w" or "b"
  const isPlayersTurn =
    (turn === "w" && game.whiteId === session.user.id) ||
    (turn === "b" && game.blackId === session.user.id);
  if (!isPlayersTurn) {
    return NextResponse.json({ error: "Not your turn" }, { status: 400 });
  }

  const now = Date.now();
  const last = game.lastMoveAt ? new Date(game.lastMoveAt).getTime() : new Date(game.createdAt).getTime();
  const elapsed = Math.max(0, now - last);

  let clockWhiteMs = game.clockWhiteMs;
  let clockBlackMs = game.clockBlackMs;

  if (turn === "w") {
    clockWhiteMs -= elapsed;
  } else {
    clockBlackMs -= elapsed;
  }

  if (clockWhiteMs <= 0 || clockBlackMs <= 0) {
    const winner = clockWhiteMs <= 0 ? game.blackId : game.whiteId;
    const result = clockWhiteMs <= 0 ? "BLACK_WIN" : "WHITE_WIN";

    await prisma.$transaction(async (tx) => {
      await tx.game.update({
        where: { id: game.id },
        data: { status: "FINISHED", result, winnerId: winner, endedAt: new Date(), clockWhiteMs, clockBlackMs },
      });

      if (game.rated) {
        const whiteUser = await tx.user.findUnique({ where: { id: game.whiteId } });
        const blackUser = await tx.user.findUnique({ where: { id: game.blackId } });
        if (whiteUser && blackUser) {
          const whiteOutcome = result === "WHITE_WIN" ? "win" : "loss";
          const blackOutcome = result === "BLACK_WIN" ? "win" : "loss";
          const whiteChange = applyRankChange(whiteUser.rank, whiteUser.rankPoints, whiteOutcome as any);
          const blackChange = applyRankChange(blackUser.rank, blackUser.rankPoints, blackOutcome as any);
          await tx.user.update({ where: { id: whiteUser.id }, data: { rank: whiteChange.rank, rankPoints: whiteChange.points } });
          await tx.user.update({ where: { id: blackUser.id }, data: { rank: blackChange.rank, rankPoints: blackChange.points } });
          await tx.rankHistory.createMany({
            data: [
              { userId: whiteUser.id, rank: whiteChange.rank, points: whiteChange.points, change: whiteChange.change, reason: whiteChange.reason },
              { userId: blackUser.id, rank: blackChange.rank, points: blackChange.points, change: blackChange.change, reason: blackChange.reason },
            ],
          });
        }
      }
    });

    return NextResponse.json({ result });
  }

  const move = chess.move({ from: parsed.data.from, to: parsed.data.to, promotion: parsed.data.promotion ?? "q" });

  if (!move) {
    return NextResponse.json({ error: "Illegal move" }, { status: 400 });
  }

  if (turn === "w") {
    clockWhiteMs += game.incrementMs;
  } else {
    clockBlackMs += game.incrementMs;
  }

  let result: "WHITE_WIN" | "BLACK_WIN" | "DRAW" | null = null;
  let winnerId: string | null = null;

  if (chess.isCheckmate()) {
    result = move.color === "w" ? "WHITE_WIN" : "BLACK_WIN";
    winnerId = result === "WHITE_WIN" ? game.whiteId : game.blackId;
  } else if (chess.isStalemate() || chess.isDraw()) {
    result = "DRAW";
  }

  const nextMoveIndex = game.moves.length;

  await prisma.$transaction(async (tx) => {
    await tx.gameMove.create({
      data: {
        gameId: game.id,
        moveIndex: nextMoveIndex,
        san: move.san,
        fen: chess.fen(),
      },
    });

    const updatedGame = await tx.game.update({
      where: { id: game.id },
      data: {
        pgn: chess.pgn(),
        lastMoveAt: new Date(now),
        clockWhiteMs,
        clockBlackMs,
        status: result ? "FINISHED" : "ONGOING",
        result: result ?? undefined,
        winnerId: winnerId ?? undefined,
        endedAt: result ? new Date() : null,
      },
    });

    if (result && updatedGame.rated) {
      const whiteOutcome = result === "WHITE_WIN" ? "win" : result === "DRAW" ? "draw" : "loss";
      const blackOutcome = result === "BLACK_WIN" ? "win" : result === "DRAW" ? "draw" : "loss";

      const whiteUser = await tx.user.findUnique({ where: { id: game.whiteId } });
      const blackUser = await tx.user.findUnique({ where: { id: game.blackId } });
      if (whiteUser && blackUser) {
        const whiteChange = applyRankChange(whiteUser.rank, whiteUser.rankPoints, whiteOutcome as any);
        const blackChange = applyRankChange(blackUser.rank, blackUser.rankPoints, blackOutcome as any);

        await tx.user.update({
          where: { id: game.whiteId },
          data: { rank: whiteChange.rank, rankPoints: whiteChange.points },
        });
        await tx.user.update({
          where: { id: game.blackId },
          data: { rank: blackChange.rank, rankPoints: blackChange.points },
        });

        await tx.rankHistory.createMany({
          data: [
            {
              userId: game.whiteId,
              rank: whiteChange.rank,
              points: whiteChange.points,
              change: whiteChange.change,
              reason: whiteChange.reason,
            },
            {
              userId: game.blackId,
              rank: blackChange.rank,
              points: blackChange.points,
              change: blackChange.change,
              reason: blackChange.reason,
            },
          ],
        });
      }
    }
  });

  return NextResponse.json({ success: true, result });
}
