import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/app-shell";
import { Card } from "@/components/ui/card";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return (
    <AppShell>
      <Card title="Notifications" className="bg-white/5">
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="rounded-xl bg-white/5 px-3 py-2">
              <p className="text-sm font-semibold text-white">{n.type}</p>
              <p className="text-xs text-slate-300">{JSON.stringify(n.data)}</p>
              <p className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
export const dynamic = "force-dynamic";
