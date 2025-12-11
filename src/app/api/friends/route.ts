import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userAId: session.user.id }, { userBId: session.user.id }],
    },
    include: { userA: true, userB: true },
  });

  const requests = await prisma.friendRequest.findMany({
    where: { OR: [{ fromUserId: session.user.id }, { toUserId: session.user.id }] },
    include: { from: true, to: true },
  });

  const friends = friendships.map((f) => (f.userAId === session.user.id ? f.userB : f.userA));

  return NextResponse.json({ friends, requests });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`friend:${ip}`, 15, 60_000)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const { username } = await request.json();
  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  if (username.toLowerCase() === session.user.username) {
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: { settings: true },
  });

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.settings && !target.settings.allowFriendRequests) {
    return NextResponse.json({ error: "User is not accepting requests" }, { status: 400 });
  }

  await prisma.friendRequest.upsert({
    where: { fromUserId_toUserId: { fromUserId: session.user.id, toUserId: target.id } },
    update: { status: "PENDING" },
    create: {
      fromUserId: session.user.id,
      toUserId: target.id,
    },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId, action } = await request.json();
  if (!requestId || !["ACCEPT", "DECLINE"].includes(action)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const req = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!req || req.toUserId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "DECLINE") {
    await prisma.friendRequest.update({ where: { id: requestId }, data: { status: "DECLINED" } });
    return NextResponse.json({ success: true });
  }

  await prisma.friendRequest.update({ where: { id: requestId }, data: { status: "ACCEPTED" } });
  const [userAId, userBId] = [req.fromUserId, req.toUserId].sort();
  await prisma.friendship.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    create: { userAId, userBId },
    update: {},
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { friendId } = await request.json();
  if (!friendId) {
    return NextResponse.json({ error: "Missing friendId" }, { status: 400 });
  }

  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { userAId: session.user.id, userBId: friendId },
        { userAId: friendId, userBId: session.user.id },
      ],
    },
  });

  return NextResponse.json({ success: true });
}
