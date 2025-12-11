import { redirect } from "next/navigation";
import { Trophy, TrendingUp } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { rankProgress, rankOrder } from "@/lib/utils";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [user, games, friendsData, rankHistory, leaderboard] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, include: { settings: true } }),
    prisma.game.findMany({
      where: { OR: [{ whiteId: session.user.id }, { blackId: session.user.id }] },
      include: { white: true, black: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    Promise.all([
      prisma.friendship.findMany({
        where: { OR: [{ userAId: session.user.id }, { userBId: session.user.id }] },
        include: { userA: true, userB: true },
      }),
      prisma.friendRequest.findMany({
        where: { OR: [{ fromUserId: session.user.id }, { toUserId: session.user.id }] },
        include: { from: true, to: true },
      }),
    ]),
    prisma.rankHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.user.findMany({ orderBy: { rankPoints: "desc" }, take: 10 }),
  ]);

  if (!user) redirect("/auth/login");
  if (!user.settings?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const [friendships, requests] = friendsData;
  const friends = friendships.map((f) => (f.userAId === session.user.id ? f.userB : f.userA));
  const activeGames = games.filter((g) => g.status !== "FINISHED");
  const finishedGames = games.filter((g) => g.status === "FINISHED");

  const totalGames = finishedGames.length;
  const wins = finishedGames.filter((g) => g.winnerId === session.user.id).length;
  const winRate = totalGames ? Math.round((wins / totalGames) * 100) : 0;

  leaderboard.sort((a, b) => {
    const r = rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank);
    if (r !== 0) return r;
    return b.rankPoints - a.rankPoints;
  });

  const lastFinished = finishedGames[0];
  const lastResult =
    lastFinished && lastFinished.result
      ? lastFinished.winnerId === session.user.id
        ? "Win"
        : lastFinished.result === "DRAW"
          ? "Draw"
          : "Loss"
      : "—";

  return (
    <AppShell>
      <div className="mb-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-300">Current rank</p>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                  {user.rank}
                </span>
                <span className="text-lg font-semibold text-white">{user.rankPoints} pts</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${rankProgress(user.rankPoints)}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-400">Points to next tier: {Math.max(0, 100 - user.rankPoints)}</p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <a href="/play?mode=ranked">Play Ranked</a>
              </Button>
              <Button variant="secondary" asChild>
                <a href="/play">Play Casual</a>
              </Button>
            </div>
          </div>
        </Card>
        <Card className="bg-white/5">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-sm text-slate-300">Last match</p>
              <p className="text-lg font-semibold text-white">{lastResult}</p>
              <p className="text-xs text-slate-400">{lastFinished ? new Date(lastFinished.createdAt).toLocaleString() : "—"}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card subtle title="Games played">
          <p className="text-3xl font-semibold">{totalGames}</p>
        </Card>
        <Card subtle title="Win rate">
          <p className="text-3xl font-semibold">{winRate}%</p>
        </Card>
        <Card subtle title="Friends online">
          <p className="text-3xl font-semibold">{friends.length}</p>
        </Card>
      </div>

      <DashboardTabs
        user={user}
        activeGames={activeGames}
        finishedGames={finishedGames}
        friends={friends}
        friendRequests={requests}
        rankHistory={rankHistory}
        leaderboard={leaderboard}
      />
    </AppShell>
  );
}
export const dynamic = "force-dynamic";
