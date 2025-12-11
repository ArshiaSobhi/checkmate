"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Game, FriendRequest, User, RankHistory } from "@prisma/client";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatMs, friendlyDate } from "@/lib/utils";
import { toast } from "sonner";

type DashboardTabsProps = {
  user: User & { settings: any | null };
  activeGames: (Game & { white: User; black: User })[];
  finishedGames: (Game & { white: User; black: User })[];
  friends: User[];
  friendRequests: (FriendRequest & { from: User; to: User })[];
  rankHistory: RankHistory[];
  leaderboard: User[];
};

export function DashboardTabs({ user, activeGames, finishedGames, friends, friendRequests, rankHistory, leaderboard }: DashboardTabsProps) {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const sendFriendRequest = async () => {
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      toast.error(payload.error ?? "Unable to send request");
      return;
    }
    toast.success("Friend request sent");
    setUsername("");
  };

  const respondRequest = async (requestId: string, action: "ACCEPT" | "DECLINE") => {
    await fetch("/api/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    router.refresh();
  };

  const removeFriend = async (friendId: string) => {
    await fetch("/api/friends", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendId }),
    });
    router.refresh();
  };

  const updateSettings = async (formData: FormData) => {
    const payload = Object.fromEntries(formData.entries());
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boardTheme: payload.boardTheme,
        pieceSet: payload.pieceSet,
        animationsEnabled: payload.animations === "on",
        soundsEnabled: payload.sounds === "on",
        showCoordinates: payload.coords === "on",
        moveConfirmation: payload.confirmation === "on",
        allowFriendRequests: payload.allowFriends === "on",
        discoverable: payload.discoverable === "on",
        showOnlineStatus: payload.showStatus === "on",
        inAppNotifications: payload.inApp === "on",
        language: "en",
        timezone: payload.timezone ?? "UTC",
        defaultTheme: payload.defaultTheme ?? "dark",
      }),
    });
    toast.success("Settings saved");
    router.refresh();
  };

  const tabs = useMemo(
    () => [
      {
        id: "games",
        label: "Games",
        content: (
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Card title="Active games" className="bg-white/5">
              <div className="space-y-3">
                {activeGames.length === 0 && <p className="text-sm text-slate-300">No active games. Start one!</p>}
                {activeGames.map((g) => (
                  <div key={g.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
                    <div>
                      <p className="text-sm text-slate-300">
                        {g.white.username} vs {g.black.username}
                      </p>
                      <p className="text-xs text-slate-400">
                        {g.mode} · {g.timeControl}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-200">
                        {formatMs(g.clockWhiteMs)} / {formatMs(g.clockBlackMs)}
                      </span>
                      <Button asChild variant="secondary">
                        <Link href={`/game/${g.id}`}>Rejoin</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Stats" className="bg-white/5">
              <p className="text-sm text-slate-300">Total games: {finishedGames.length}</p>
              <p className="text-sm text-slate-300">Recent result: {finishedGames[0]?.result ?? "—"}</p>
              <p className="text-sm text-slate-300">Time control spread: Blitz heavy</p>
            </Card>
            <Card title="History" className="bg-white/5 lg:col-span-2">
              <div className="space-y-3">
                {finishedGames.slice(0, 6).map((g) => (
                  <div key={g.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                    <div>
                      <p className="font-semibold">
                        {g.white.username} vs {g.black.username}
                      </p>
                      <p className="text-xs text-slate-400">
                        {g.mode} · {g.timeControl} · {friendlyDate(g.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-200">{g.result ?? "In progress"}</span>
                      <Button asChild variant="ghost">
                        <Link href={`/game/${g.id}`}>Review</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ),
      },
      {
        id: "friends",
        label: "Friends",
        content: (
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Card title="Friends" className="bg-white/5">
              <div className="space-y-3">
                {friends.length === 0 && <p className="text-sm text-slate-300">No friends yet.</p>}
                {friends.map((f) => (
                  <div key={f.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                    <div>
                      <p className="font-semibold">{f.username}</p>
                      <p className="text-xs text-slate-400">{f.rank} · {f.rankPoints} pts</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="secondary">
                        <Link href={`/play?friendId=${f.id}&mode=FRIEND`}>Invite</Link>
                      </Button>
                      <Button variant="ghost" onClick={() => removeFriend(f.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Requests" className="bg-white/5">
              <div className="space-y-2">
                {friendRequests.length === 0 && <p className="text-sm text-slate-300">No pending requests.</p>}
                {friendRequests.map((req) => (
                  <div key={req.id} className="rounded-lg bg-white/5 p-3">
                    <p className="font-semibold">{req.from.username === user.username ? req.to.username : req.from.username}</p>
                    <p className="text-xs text-slate-400">Status: {req.status}</p>
                    {req.status === "PENDING" && req.toUserId === user.id && (
                      <div className="mt-2 flex gap-2">
                        <Button variant="primary" onClick={() => respondRequest(req.id, "ACCEPT")}>
                          Accept
                        </Button>
                        <Button variant="ghost" onClick={() => respondRequest(req.id, "DECLINE")}>
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <Input label="Add by username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="exact username" />
                <Button className="w-full" onClick={sendFriendRequest}>
                  Send request
                </Button>
              </div>
            </Card>
          </div>
        ),
      },
      {
        id: "ranking",
        label: "Ranking",
        content: (
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Card title="Promotion timeline" className="bg-white/5">
              <div className="space-y-3">
                {rankHistory.length === 0 && <p className="text-sm text-slate-300">No rank changes yet.</p>}
                {rankHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                    <div>
                      <p className="font-semibold">{entry.rank} · {entry.points} pts</p>
                      <p className="text-xs text-slate-400">{friendlyDate(entry.createdAt)}</p>
                    </div>
                    <span className="text-xs text-emerald-200">{entry.change > 0 ? "+" : ""}{entry.change}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Leaderboard" className="bg-white/5">
              <div className="space-y-2">
                {leaderboard.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-sm text-slate-300">#{idx + 1}</span>
                    <div className="flex-1 px-2">
                      <p className="font-semibold">{p.username}</p>
                      <p className="text-xs text-slate-400">{p.rank}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-200">{p.rankPoints}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ),
      },
      {
        id: "settings",
        label: "Settings",
        content: (
          <Card title="Preferences" className="bg-white/5">
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                updateSettings(data);
              }}
            >
              <Select
                label="Board theme"
                name="boardTheme"
                defaultValue={user.settings?.boardTheme ?? "classic"}
                options={[
                  { value: "classic", label: "Classic" },
                  { value: "dark", label: "Dark" },
                  { value: "wood", label: "Wood" },
                ]}
              />
              <Select
                label="Piece set"
                name="pieceSet"
                defaultValue={user.settings?.pieceSet ?? "neo"}
                options={[
                  { value: "neo", label: "Neo" },
                  { value: "alpha", label: "Alpha" },
                  { value: "contrast", label: "Contrast" },
                ]}
              />
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input name="animations" type="checkbox" defaultChecked={user.settings?.animationsEnabled ?? true} className="h-4 w-4" />
                Move animations
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input name="sounds" type="checkbox" defaultChecked={user.settings?.soundsEnabled ?? true} className="h-4 w-4" />
                Sounds
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input name="coords" type="checkbox" defaultChecked={user.settings?.showCoordinates ?? true} className="h-4 w-4" />
                Show board coordinates
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input name="confirmation" type="checkbox" defaultChecked={user.settings?.moveConfirmation ?? false} className="h-4 w-4" />
                Move confirmation
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input name="allowFriends" type="checkbox" defaultChecked={user.settings?.allowFriendRequests ?? true} className="h-4 w-4" />
                Allow friend requests
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input name="discoverable" type="checkbox" defaultChecked={user.settings?.discoverable ?? true} className="h-4 w-4" />
                Discoverable in search
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input name="showStatus" type="checkbox" defaultChecked={user.settings?.showOnlineStatus ?? true} className="h-4 w-4" />
                Show online status
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input name="inApp" type="checkbox" defaultChecked={user.settings?.inAppNotifications ?? true} className="h-4 w-4" />
                In-app notifications
              </label>
              <Select
                label="Timezone"
                name="timezone"
                defaultValue={user.settings?.timezone ?? "UTC"}
                options={[
                  { value: "UTC", label: "UTC" },
                  { value: "America/New_York", label: "New York" },
                  { value: "Europe/London", label: "London" },
                  { value: "Asia/Singapore", label: "Singapore" },
                ]}
              />
              <Select
                label="Default theme"
                name="defaultTheme"
                defaultValue={user.settings?.defaultTheme ?? "dark"}
                options={[
                  { value: "dark", label: "Dark" },
                  { value: "light", label: "Light" },
                ]}
              />
              <div className="md:col-span-2">
                <Button type="submit">Save settings</Button>
              </div>
            </form>
          </Card>
        ),
      },
    ],
    [activeGames, finishedGames, friends, friendRequests, rankHistory, leaderboard, user, username],
  );

  return <Tabs tabs={tabs} />;
}
