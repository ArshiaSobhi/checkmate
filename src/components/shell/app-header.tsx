"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, Shield, Trophy, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/play", label: "Play" },
  { href: "/games", label: "Games" },
  { href: "/friends", label: "Friends" },
  { href: "/ranking", label: "Ranking" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const { data: notifications } = useSWR<{ unread: number }>(
    session?.user ? "/api/notifications?summary=1" : null,
    (url: string) => fetch(url).then((r) => r.json()),
  );

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Checkmate" width={32} height={32} className="rounded-lg" />
            <span className="text-base font-semibold">Checkmate</span>
          </Link>
          <nav className="hidden items-center gap-3 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5",
                  pathname.startsWith(item.href) && "bg-white/10 text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-emerald-100 md:flex">
            <Trophy className="h-4 w-4" />
            <span>{session?.user.rank ?? "Bronze"}</span>
            <span className="text-slate-300">{session?.user.rankPoints ?? 0} pts</span>
          </div>
          <Link href="/notifications" className="relative rounded-full p-2 hover:bg-white/5" aria-label="Notifications">
            <Bell className="h-5 w-5 text-white" />
            {notifications?.unread ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                {notifications.unread}
              </span>
            ) : null}
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" className="hidden rounded-full p-2 text-slate-200 hover:bg-white/5 md:inline-flex" aria-label="Admin">
              <Shield className="h-5 w-5" />
            </Link>
          )}
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setOpen((p) => !p)}
                className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm font-semibold hover:bg-white/10"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{session.user.username}</span>
                <Menu className="h-4 w-4" />
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/5 bg-slate-900 p-2 shadow-2xl">
                  <Link href={`/profile/${session.user.username}`} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/5">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/5">
                    <Shield className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="secondary">Login</Button>
            </Link>
          )}
          <button className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-sm font-semibold text-white md:hidden">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
