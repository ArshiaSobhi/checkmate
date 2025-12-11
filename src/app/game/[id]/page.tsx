import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/app-shell";
import { GameClient } from "@/components/game/game-client";

export default async function GamePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: { white: true, black: true, moves: { orderBy: { moveIndex: "asc" } } },
  });
  if (!game) return notFound();
  if (game.whiteId !== session.user.id && game.blackId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <AppShell>
      <GameClient gameId={game.id} currentUserId={session.user.id} initial={game} initialMoves={game.moves} />
    </AppShell>
  );
}
export const dynamic = "force-dynamic";
