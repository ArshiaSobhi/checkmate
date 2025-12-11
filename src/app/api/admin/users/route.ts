import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function assertAdmin(role?: string) {
  if (role !== "ADMIN") {
    throw new Error("forbidden");
  }
}

export async function GET(request: Request) {
  const session = await auth();
  try {
    assertAdmin(session?.user.role);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { gamesWhite: true, gamesBlack: true } } },
  });

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  const session = await auth();
  try {
    assertAdmin(session?.user.role);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, disabled } = await request.json();
  if (!userId) return NextResponse.json({ error: "Missing user" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { disabled: !!disabled },
  });

  return NextResponse.json({ user });
}
