"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

type Props = {
  user: any;
  settings: any;
};

export function SettingsForm({ user, settings }: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "avatar-1");
  const [boardTheme, setBoardTheme] = useState(settings?.boardTheme ?? "classic");
  const [defaultTheme, setDefaultTheme] = useState(settings?.defaultTheme ?? "dark");

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user]);

  const save = async () => {
    setLoading(true);
    await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatar }),
    });
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boardTheme,
        pieceSet: settings?.pieceSet ?? "neo",
        animationsEnabled: settings?.animationsEnabled ?? true,
        soundsEnabled: settings?.soundsEnabled ?? true,
        showCoordinates: settings?.showCoordinates ?? true,
        moveConfirmation: settings?.moveConfirmation ?? false,
        allowFriendRequests: settings?.allowFriendRequests ?? true,
        discoverable: settings?.discoverable ?? true,
        showOnlineStatus: settings?.showOnlineStatus ?? true,
        inAppNotifications: settings?.inAppNotifications ?? true,
        language: "en",
        timezone: settings?.timezone ?? "UTC",
        defaultTheme,
      }),
    });
    setLoading(false);
    toast.success("Settings updated");
  };

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const currentPassword = (form.elements.namedItem("currentPassword") as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res.ok) toast.success("Password updated");
    else {
      const data = await res.json();
      toast.error(data.error ?? "Unable to update password");
    }
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
        <Select
          label="Avatar"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          options={[
            { value: "avatar-1", label: "Avatar 1" },
            { value: "avatar-2", label: "Avatar 2" },
            { value: "avatar-3", label: "Avatar 3" },
          ]}
        />
        <Select
          label="Board theme"
          value={boardTheme}
          onChange={(e) => setBoardTheme(e.target.value)}
          options={[
            { value: "classic", label: "Classic" },
            { value: "dark", label: "Dark" },
            { value: "wood", label: "Wood" },
          ]}
        />
        <Select
          label="UI theme"
          value={defaultTheme}
          onChange={(e) => setDefaultTheme(e.target.value)}
          options={[
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
        />
      </div>
      <Button onClick={save} disabled={loading}>
        {loading ? "Saving..." : "Save changes"}
      </Button>

      <form onSubmit={changePassword} className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4">
        <p className="text-sm font-semibold text-white">Change password</p>
        <Input label="Current password" name="currentPassword" type="password" required />
        <Input label="New password" name="newPassword" type="password" required />
        <Button type="submit">Update password</Button>
      </form>
    </div>
  );
}
