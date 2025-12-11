import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/shell/app-shell";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { settings: true } });
  if (!user) redirect("/auth/login");

  return (
    <AppShell>
      <Card className="bg-white/5">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Settings</p>
          <h1 className="text-3xl font-semibold">Account & Chess preferences</h1>
        </div>
        <SettingsForm user={user} settings={user.settings} />
      </Card>
    </AppShell>
  );
}
export const dynamic = "force-dynamic";
