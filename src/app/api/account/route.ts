import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, avatar, email, currentPassword, newPassword } = await request.json();
  const data: Record<string, any> = {};

  if (name) data.name = name;
  if (avatar) data.avatar = avatar;
  if (email) data.email = email.toLowerCase();

  if (newPassword) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password || !currentPassword) {
      return NextResponse.json({ error: "Current password required" }, { status: 400 });
    }
    const match = await compare(currentPassword, user.password);
    if (!match) return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
    data.password = await hash(newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  return NextResponse.json({ user: updated });
}
