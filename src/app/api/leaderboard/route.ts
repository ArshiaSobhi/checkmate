import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rankOrder } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "global";

  const users = await prisma.user.findMany({
    where: scope === "friends" && session?.user ? { OR: [{ friendshipsA: { some: { userBId: session.user.id } } }, { friendshipsB: { some: { userAId: session.user.id } } }] } : undefined,
    orderBy: [{ rankPoints: "desc" }],
    take: 50,
  });

  users.sort((a, b) => {
    const rankDiff = rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank);
    if (rankDiff !== 0) return rankDiff;
    return b.rankPoints - a.rankPoints;
  });

  return NextResponse.json({
    leaderboard: users.map((u, idx) => ({
      position: idx + 1,
      username: u.username,
      rank: u.rank,
      points: u.rankPoints,
      id: u.id,
    })),
  });
}
