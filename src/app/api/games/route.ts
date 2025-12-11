import { NextResponse } from "next/server";
import { GameStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTimeControlConfig } from "@/lib/utils";
import { queueSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? "1");
  const take = Number(searchParams.get("limit") ?? "10");

  const where =
    status === "active"
      ? {
          status: { in: ["ONGOING", "QUEUED"] as GameStatus[] },
        }
      : undefined;

  const games = await prisma.game.findMany({
    where: {
      OR: [{ whiteId: session.user.id }, { blackId: session.user.id }],
      ...(where ?? {}),
    },
    include: { white: true, black: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * take,
    take,
  });

  const total = await prisma.game.count({
    where: {
      OR: [{ whiteId: session.user.id }, { blackId: session.user.id }],
      ...(where ?? {}),
    },
  });

  return NextResponse.json({ games, total });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`queue:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Slow down" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = queueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { mode, timeControl, friendId } = parsed.data;
  if (mode === "RANKED" && !session.user.emailVerified) {
    return NextResponse.json({ error: "Verify email to play ranked." }, { status: 403 });
  }

  const config = getTimeControlConfig(timeControl);
  const baseGame = {
    mode,
    timeControl,
    clockWhiteMs: config.initialMs,
    clockBlackMs: config.initialMs,
    incrementMs: config.incrementMs,
    status: "ONGOING" as const,
    rated: mode === "RANKED",
  };

  if (mode === "FRIEND" && friendId) {
    const friend = await prisma.user.findUnique({ where: { id: friendId } });
    if (!friend) return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    const isFriend = await prisma.friendship.count({
      where: {
        OR: [
          { userAId: session.user.id, userBId: friendId },
          { userAId: friendId, userBId: session.user.id },
        ],
      },
    });
    if (!isFriend) {
      return NextResponse.json({ error: "You must be friends to start this match." }, { status: 403 });
    }
    const whiteFirst = Math.random() > 0.5;
    const game = await prisma.game.create({
      data: {
        ...baseGame,
        whiteId: whiteFirst ? session.user.id : friendId,
        blackId: whiteFirst ? friendId : session.user.id,
      },
    });
    return NextResponse.json({ gameId: game.id, status: "STARTED" });
  }

  const existingWaiting = await prisma.matchQueue.findFirst({
    where: {
      mode,
      timeControl,
      status: "WAITING",
      NOT: { userId: session.user.id },
    },
    orderBy: { createdAt: "asc" },
  });

  if (existingWaiting) {
    const whiteFirst = Math.random() > 0.5;
    const game = await prisma.game.create({
      data: {
        ...baseGame,
        whiteId: whiteFirst ? session.user.id : existingWaiting.userId,
        blackId: whiteFirst ? existingWaiting.userId : session.user.id,
      },
    });
    await prisma.matchQueue.update({
      where: { id: existingWaiting.id },
      data: { status: "MATCHED", gameId: game.id },
    });
    return NextResponse.json({ gameId: game.id, status: "MATCHED" });
  }

  await prisma.matchQueue.upsert({
    where: { userId_mode_status: { userId: session.user.id, mode, status: "WAITING" } },
    update: { createdAt: new Date(), timeControl },
    create: { userId: session.user.id, mode, timeControl },
  });

  return NextResponse.json({ status: "QUEUED" });
}
