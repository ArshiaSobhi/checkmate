"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Unable to send reset link");
      return;
    }
    toast.success("Check your email for a reset link");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <Card className="w-full max-w-md bg-slate-900/80">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">Reset password</p>
          <h1 className="text-2xl font-semibold">Send a reset link</h1>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send link"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-300">
          <Link href="/auth/login" className="text-emerald-300">
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
}
