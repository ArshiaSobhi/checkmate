import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const body = await request.json();
  const { password } = body;
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }

  const { token } = await params;
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date() || record.used) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);
  await prisma.user.update({
    where: { id: record.userId },
    data: { password: passwordHash },
  });

  await prisma.passwordResetToken.update({
    where: { token },
    data: { used: true },
  });

  return NextResponse.json({ success: true });
}
