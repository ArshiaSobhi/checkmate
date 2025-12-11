import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`reset:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ success: true }); // avoid leaking
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: expires,
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/auth/reset/${token}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your Checkmate password",
    html: `<p>Use the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  return NextResponse.json({ success: true });
}
