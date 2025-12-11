"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { timeControls } from "@/lib/utils";
import { toast } from "sonner";

type PlayClientProps = {
  friends: { id: string; username: string }[];
};

export function PlayClient({ friends }: PlayClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"RANKED" | "CASUAL" | "FRIEND">("RANKED");
  const [timeControl, setTimeControl] = useState("3+2");
  const [friendId, setFriendId] = useState("");
  const [queued, setQueued] = useState(false);
  const [message, setMessage] = useState("");

  const start = async () => {
    setMessage("Matching...");
    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, timeControl, friendId: mode === "FRIEND" ? friendId : undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Unable to start game");
      setMessage("");
      return;
    }
    if (data.gameId) {
      router.push(`/game/${data.gameId}`);
    } else {
      setQueued(true);
      setMessage("Searching for opponent...");
    }
  };

  useEffect(() => {
    if (!queued) return;
    const id = setInterval(async () => {
      const res = await fetch("/api/games?status=active");
      if (!res.ok) return;
      const data = await res.json();
      const newest = data.games?.find((g: any) => g.status === "ONGOING");
      if (newest) {
        setQueued(false);
        router.push(`/game/${newest.id}`);
      }
    }, 3000);
    return () => clearInterval(id);
  }, [queued, router]);

  return (
    <div className="space-y-4">
      <Select
        label="Mode"
        value={mode}
        onChange={(e) => setMode(e.target.value as any)}
        options={[
          { value: "RANKED", label: "Ranked (affects points)" },
          { value: "CASUAL", label: "Casual" },
          { value: "FRIEND", label: "Versus friend" },
        ]}
      />
      {mode === "FRIEND" && (
        <Select
          label="Choose friend"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
          options={friends.length ? friends.map((f) => ({ value: f.id, label: f.username })) : [{ value: "", label: "No friends available" }]}
        />
      )}
      <Select
        label="Time control"
        value={timeControl}
        onChange={(e) => setTimeControl(e.target.value)}
        options={timeControls.map((t) => ({ value: t.value, label: t.label }))}
      />
      <Button onClick={start} className="w-full">
        {queued ? "Searching..." : "Start match"}
      </Button>
      {message && <p className="text-sm text-slate-300">{message}</p>}
    </div>
  );
}
