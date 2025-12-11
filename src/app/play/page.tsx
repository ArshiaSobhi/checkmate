import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/app-shell";
import { Card } from "@/components/ui/card";
import { PlayClient } from "@/components/play/play-client";

export default async function PlayPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userAId: session.user.id }, { userBId: session.user.id }] },
    include: { userA: true, userB: true },
  });
  const friends = friendships.map((f) => (f.userAId === session.user.id ? f.userB : f.userA));

  return (
    <AppShell>
      <Card className="bg-white/5">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Start a game</p>
          <h1 className="text-2xl font-semibold text-white">Choose your mode and time</h1>
          <p className="text-sm text-slate-300">Ranked games require verified email. Friend games are always casual.</p>
        </div>
        <PlayClient friends={friends.map((f) => ({ id: f.id, username: f.username }))} />
      </Card>
    </AppShell>
  );
}
export const dynamic = "force-dynamic";
