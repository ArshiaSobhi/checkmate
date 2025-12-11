import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { signupSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!rateLimit(`register:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many attempts. Please wait." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { username, email, password, confirmPassword, acceptTerms } = parsed.data;

    if (!acceptTerms) {
      return NextResponse.json({ error: "You must accept the terms." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
      },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Email or username already taken." }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        name: username,
        password: passwordHash,
        settings: {
          create: {},
        },
      },
    });

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const verifyUrl = `${baseUrl}/auth/verify?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your Checkmate account",
      html: `<p>Welcome to Checkmate! Verify your email to unlock ranked play.</p><p><a href="${verifyUrl}">Verify account</a></p>`,
    });

    return NextResponse.json({ success: true, message: "Account created. Please verify your email." });
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json(
      { error: "Unable to create account. Check database connection and env configuration." },
      { status: 500 },
    );
  }
}
