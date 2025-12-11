import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const user = searchParams.get("user");
  const mode = searchParams.get("mode");

  const games = await prisma.game.findMany({
    where: {
      mode: mode ? (mode as any) : undefined,
      OR: user ? [{ white: { username: user } }, { black: { username: user } }] : undefined,
    },
    include: { white: true, black: true, moves: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ games });
}
