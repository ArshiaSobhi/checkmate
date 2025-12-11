import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gameResultLabel } from "@/lib/utils";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const game = await prisma.game.findUnique({
    where: { id },
    include: { white: true, black: true, moves: true },
  });

  if (!game || (game.whiteId !== session.user.id && game.blackId !== session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const moves = await prisma.gameMove.findMany({
    where: { gameId: game.id },
    orderBy: { moveIndex: "asc" },
  });

  return NextResponse.json({
    game,
    moves,
    summary: gameResultLabel(game.result),
  });
}
