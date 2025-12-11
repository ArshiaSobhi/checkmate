import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { avatar, boardTheme, timezone, defaultTheme } = await request.json();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatar ?? "avatar-1" },
    }),
    prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        boardTheme: boardTheme ?? "classic",
        timezone: timezone ?? "UTC",
        defaultTheme: defaultTheme ?? "dark",
        onboardingCompleted: true,
      },
      create: {
        userId: session.user.id,
        boardTheme: boardTheme ?? "classic",
        timezone: timezone ?? "UTC",
        defaultTheme: defaultTheme ?? "dark",
        onboardingCompleted: true,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
