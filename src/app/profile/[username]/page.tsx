import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { friendlyDate } from "@/lib/utils";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const profile = await prisma.user.findUnique({
    where: { username: params.username },
    include: { settings: true },
  });
  if (!profile) return notFound();
  if (profile.settings && !profile.settings.discoverable && session.user.id !== profile.id) {
    redirect("/dashboard");
  }

  const games = await prisma.game.findMany({
    where: { OR: [{ whiteId: profile.id }, { blackId: profile.id }] },
    include: { white: true, black: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Player profile</p>
          <h1 className="text-3xl font-semibold text-white">{profile.username}</h1>
          <p className="text-sm text-slate-300">{profile.rank} · {profile.rankPoints} pts</p>
        </div>
        {session.user.id !== profile.id && (
          <Button asChild>
            <a href={`/friends?add=${profile.username}`}>Add friend</a>
          </Button>
        )}
      </div>
      <Card title="Recent games" className="bg-white/5">
        <div className="space-y-3">
          {games.map((g) => (
            <div key={g.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
              <div>
                <p className="font-semibold">{g.white.username} vs {g.black.username}</p>
                <p className="text-xs text-slate-400">{friendlyDate(g.createdAt)} · {g.timeControl}</p>
              </div>
              <span className="text-xs text-emerald-200">{g.result ?? g.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
export const dynamic = "force-dynamic";
