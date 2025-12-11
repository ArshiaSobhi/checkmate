import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HeroBoard } from "@/components/landing/hero-board";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Crown, ShieldCheck, Sparkles, Users } from "lucide-react";

const features = [
  {
    title: "Ranked ladder",
    description: "Climb six handcrafted tiers with transparent point changes.",
    icon: <Crown className="h-5 w-5 text-amber-300" />,
  },
  {
    title: "Play with friends",
    description: "One-tap invites, real-time presence, and rematches.",
    icon: <Users className="h-5 w-5 text-emerald-300" />,
  },
  {
    title: "Game reviews",
    description: "Step through moves, autoplay replays, and flip the board.",
    icon: <Sparkles className="h-5 w-5 text-sky-300" />,
  },
  {
    title: "Secure by design",
    description: "Protected auth, rate limits, and admin oversight built-in.",
    icon: <ShieldCheck className="h-5 w-5 text-indigo-300" />,
  },
];

const steps = [
  { title: "Sign up", text: "Create your identity, pick your avatar, and set preferences." },
  { title: "Play matches", text: "Jump into casual or ranked games with a fluid queue." },
  { title: "Rank up", text: "Earn points, climb six tiers, and celebrate promos." },
  { title: "Review games", text: "Replay every move and share links with friends." },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Checkmate" width={38} height={38} priority />
          <span className="text-lg font-semibold tracking-tight">Checkmate</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#how" className="hover:text-white">
            How it works
          </a>
          <a href="#screens" className="hover:text-white">
            Screens
          </a>
          <Link href="/auth/login" className="hover:text-white">
            Login
          </Link>
          <Link href="/auth/signup">
            <Button className="h-10 px-4">Sign up</Button>
          </Link>
        </nav>
      </header>

      <section className="relative overflow-hidden fade-in">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute right-[-10%] top-[10%] h-72 w-72 rounded-full bg-sky-500/25 blur-3xl" />
        </div>
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 pb-20 pt-6 lg:flex-row lg:items-start lg:pt-10">
          <div className="flex-1 space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
              <Clock className="h-4 w-4" />
              Real-time chess anywhere
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Play beautiful, fast chess — <span className="text-emerald-400">Checkmate</span> every session.
            </h1>
            <p className="max-w-2xl text-lg text-slate-200">
              A premium chess experience with ranked ladder, friend invites, live presence, and deep post-game review. Built for mobile and desktop with zero compromises.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/auth/signup">
                <Button className="h-12 px-6 text-base">Play Now</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="secondary" className="h-12 px-6 text-base">
                  Log in
                </Button>
              </Link>
              <Link href="/spectate">
                <Button variant="ghost" className="h-12 px-6 text-base">
                  Watch live games
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-300" />
                <span>6-tier rank ladder</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span>Secure & moderated</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <HeroBoard />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-6xl px-6 pb-16 fade-in">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">Why players stay</p>
            <h2 className="text-3xl font-semibold">High-end experience from the first move.</h2>
          </div>
          <Link href="/auth/signup">
            <Button variant="ghost">Start free account</Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full bg-white/5">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="stats" className="mx-auto w-full max-w-6xl px-6 pb-16 fade-in">
        <Card className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute right-10 top-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-300">Players online</p>
              <p className="text-3xl font-semibold">1,248</p>
            </div>
            <div>
              <p className="text-sm text-slate-300">Games in progress</p>
              <p className="text-3xl font-semibold">342</p>
            </div>
            <div>
              <p className="text-sm text-slate-300">Lifetime games</p>
              <p className="text-3xl font-semibold">183,901</p>
            </div>
          </div>
        </Card>
      </section>

      <section id="how" className="mx-auto w-full max-w-6xl px-6 pb-16 fade-in">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">How it works</p>
          <h2 className="text-3xl font-semibold">Four simple steps to your first win.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <Card key={step.title} className="h-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-100">
                {idx + 1}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{step.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="screens" className="mx-auto w-full max-w-6xl px-6 pb-16 fade-in">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">Product shots</p>
            <h2 className="text-3xl font-semibold">Gameplay, dashboard, and leaderboards.</h2>
          </div>
          <Link href="/auth/signup">
            <Button variant="secondary">Jump in</Button>
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="bg-white/5">
            <Image src="/mock-dashboard.svg" alt="Dashboard mock" width={900} height={600} className="w-full rounded-xl" />
          </Card>
          <Card className="bg-white/5">
            <Image src="/mock-game.svg" alt="Board mock" width={900} height={600} className="w-full rounded-xl" />
          </Card>
          <Card className="bg-white/5">
            <Image src="/mock-leaderboard.svg" alt="Leaderboard mock" width={900} height={600} className="w-full rounded-xl" />
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16 fade-in">
        <Card className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">Testimonials</p>
            <h3 className="text-2xl font-semibold">“Checkmate feels premium without getting in the way.”</h3>
            <p className="text-sm text-slate-300">Alex G., early beta player</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-amber-300">★★★★★</div>
            <p className="text-sm text-slate-300">4.9/5 from early cohort</p>
          </div>
        </Card>
      </section>

      <footer className="border-t border-white/5 bg-slate-950/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Checkmate" width={32} height={32} />
            <span className="text-sm text-slate-300">Built for serious chess, crafted for speed.</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/support">Support</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="https://twitter.com" target="_blank" rel="noreferrer">
              Twitter
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
