import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const game = await prisma.game.findUnique({ where: { id } });
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (game.status !== "ONGOING") {
    return NextResponse.json({ error: "Game finished" }, { status: 400 });
  }

  const isWhite = game.whiteId === session.user.id;
  if (!isWhite && game.blackId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = isWhite ? "BLACK_WIN" : "WHITE_WIN";
  const winnerId = isWhite ? game.blackId : game.whiteId;

  await prisma.game.update({
    where: { id: game.id },
    data: { status: "FINISHED", result, winnerId, endedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
