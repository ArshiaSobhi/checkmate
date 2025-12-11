import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";
import { Card } from "@/components/ui/card";
import { AdminPanel } from "@/components/admin/admin-panel";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <AppShell>
      <Card className="bg-white/5">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Admin</p>
          <h1 className="text-3xl font-semibold">Moderation & system</h1>
        </div>
        <AdminPanel />
      </Card>
    </AppShell>
  );
}
export const dynamic = "force-dynamic";
