import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  const { username } = await params;
  const profile = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: { settings: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = session?.user.id === profile.id;
  if (profile.settings && !profile.settings.discoverable && !isOwner) {
    return NextResponse.json({ error: "Profile hidden" }, { status: 403 });
  }

  const games = await prisma.game.findMany({
    where: { OR: [{ whiteId: profile.id }, { blackId: profile.id }] },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { white: true, black: true },
  });

  const totalGames = await prisma.game.count({
    where: { OR: [{ whiteId: profile.id }, { blackId: profile.id }], status: "FINISHED" },
  });
  const wins = await prisma.game.count({
    where: {
      status: "FINISHED",
      OR: [
        { winnerId: profile.id },
        { result: "WHITE_WIN", whiteId: profile.id },
        { result: "BLACK_WIN", blackId: profile.id },
      ],
    },
  });

  return NextResponse.json({
    profile: {
      id: profile.id,
      username: profile.username,
      name: profile.name,
      avatar: profile.avatar,
      rank: profile.rank,
      rankPoints: profile.rankPoints,
      wins,
      totalGames,
      settings: profile.settings,
      recentGames: games,
    },
  });
}
