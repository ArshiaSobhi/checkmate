import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { friendlyDate } from "@/lib/utils";

export default async function SpectatePage() {
  const games = await prisma.game.findMany({
    where: { status: "ONGOING" },
    include: { white: true, black: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <AppShell>
      <Card className="bg-white/5">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Watch live</p>
          <h1 className="text-3xl font-semibold text-white">Ongoing games</h1>
        </div>
        <div className="space-y-3">
          {games.map((g) => (
            <div key={g.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
              <div>
                <p className="font-semibold">
                  {g.white.username} vs {g.black.username}
                </p>
                <p className="text-xs text-slate-400">
                  {g.mode} · {g.timeControl} · {friendlyDate(g.createdAt)}
                </p>
              </div>
              <Button asChild variant="secondary">
                <a href={`/game/${g.id}`}>Open</a>
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
export const dynamic = "force-dynamic";
