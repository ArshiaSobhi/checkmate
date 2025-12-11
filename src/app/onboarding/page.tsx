import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/onboarding/wizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const settings = await prisma.userSettings.findUnique({ where: { userId: session.user.id } });
  if (settings?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <Card className="w-full max-w-2xl bg-slate-900/80">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Welcome to Checkmate</p>
        <h1 className="mt-2 text-3xl font-semibold">Let&apos;s set up your board</h1>
        <p className="mt-2 text-slate-300">Pick an avatar, board theme, timezone, and UI preference. You can change these later.</p>
        <div className="mt-6">
          <OnboardingWizard />
        </div>
      </Card>
    </div>
  );
}
export const dynamic = "force-dynamic";
