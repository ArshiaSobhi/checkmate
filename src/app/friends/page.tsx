import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/app-shell";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [user, games, friendships, requests, rankHistory, leaderboard] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, include: { settings: true } }),
    prisma.game.findMany({
      where: { OR: [{ whiteId: session.user.id }, { blackId: session.user.id }] },
      include: { white: true, black: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.friendship.findMany({
      where: { OR: [{ userAId: session.user.id }, { userBId: session.user.id }] },
      include: { userA: true, userB: true },
    }),
    prisma.friendRequest.findMany({ where: { OR: [{ fromUserId: session.user.id }, { toUserId: session.user.id }] }, include: { from: true, to: true } }),
    prisma.rankHistory.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.user.findMany({ orderBy: { rankPoints: "desc" }, take: 8 }),
  ]);

  if (!user) redirect("/auth/login");

  const friends = friendships.map((f) => (f.userAId === session.user.id ? f.userB : f.userA));
  const activeGames = games.filter((g) => g.status !== "FINISHED");
  const finishedGames = games.filter((g) => g.status === "FINISHED");

  return (
    <AppShell>
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
