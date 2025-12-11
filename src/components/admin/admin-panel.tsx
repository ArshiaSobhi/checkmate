"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export function AdminPanel() {
  const [query, setQuery] = useState("");
  const { data, mutate } = useSWR(`/api/admin/users?q=${query}`, (url) => fetch(url).then((r) => r.json()));
  const { data: games } = useSWR("/api/admin/games", (url) => fetch(url).then((r) => r.json()));

  const toggleUser = async (userId: string, disabled: boolean) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, disabled }),
    });
    if (res.ok) {
      toast.success("Updated user");
      mutate();
    } else {
      toast.error("Unable to update user");
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Users" className="bg-white/5">
        <div className="mb-3">
          <Input placeholder="Search username or email" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="space-y-2">
          {data?.users?.map((u: any) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <div>
                <p className="font-semibold">{u.username}</p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">{u.disabled ? "Disabled" : "Active"}</span>
                <Button variant={u.disabled ? "secondary" : "danger"} onClick={() => toggleUser(u.id, !u.disabled)}>
                  {u.disabled ? "Enable" : "Disable"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Recent games" className="bg-white/5">
        <div className="space-y-2">
          {games?.games?.map((g: any) => (
            <div key={g.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <div>
                <p className="font-semibold">
                  {g.white.username} vs {g.black.username}
                </p>
                <p className="text-xs text-slate-400">
                  {g.mode} · {g.timeControl}
                </p>
              </div>
              <span className="text-xs text-emerald-200">{g.result ?? g.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
