import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { friendlyDate } from "@/lib/utils";

export default async function GamesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const games = await prisma.game.findMany({
    where: { OR: [{ whiteId: session.user.id }, { blackId: session.user.id }] },
    include: { white: true, black: true },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-semibold text-white">Your games</h1>
      <div className="space-y-3">
        {games.map((g) => (
          <Card key={g.id} className="bg-white/5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  {g.white.username} vs {g.black.username}
                </p>
                <p className="text-xs text-slate-400">
                  {g.mode} · {g.timeControl} · {friendlyDate(g.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-200">{g.result ?? g.status}</span>
                <Button asChild variant="secondary">
                  <a href={`/game/${g.id}`}>{g.status === "ONGOING" ? "Rejoin" : "Review"}</a>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
export const dynamic = "force-dynamic";
