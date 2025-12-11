import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/app-shell";
import { Card } from "@/components/ui/card";
import { rankOrder } from "@/lib/utils";

export default async function RankingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [user, leaderboard, rankHistory] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, include: { settings: true } }),
    prisma.user.findMany({ orderBy: { rankPoints: "desc" }, take: 30 }),
    prisma.rankHistory.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 12 }),
  ]);
  if (!user) redirect("/auth/login");

  leaderboard.sort((a, b) => {
    const r = rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank);
    if (r !== 0) return r;
    return b.rankPoints - a.rankPoints;
  });

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Ranking</p>
        <h1 className="text-3xl font-semibold">Leaderboard & your journey</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card title="Global leaderboard" className="bg-white/5">
          <div className="space-y-2">
            {leaderboard.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                <span className="text-xs text-slate-400">#{idx + 1}</span>
                <div className="flex-1 px-3">
                  <p className="font-semibold">{p.username}</p>
                  <p className="text-xs text-slate-400">{p.rank}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-200">{p.rankPoints} pts</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Your history" className="bg-white/5">
          <div className="space-y-2">
            {rankHistory.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                <div>
                  <p className="font-semibold">{r.rank}</p>
                  <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm text-emerald-200">
                  {r.change > 0 ? "+" : ""}
                  {r.change} pts
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
export const dynamic = "force-dynamic";
