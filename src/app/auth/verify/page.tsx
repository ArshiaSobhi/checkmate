"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function VerifyClient() {
  const search = useSearchParams();
  const router = useRouter();
  const token = search.get("token");
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");

  useEffect(() => {
    const verify = async () => {
      if (!token) return setStatus("error");
      const res = await fetch(`/api/auth/verify?token=${token}`);
      if (res.ok) setStatus("success");
      else setStatus("error");
    };
    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <Card className="w-full max-w-md bg-slate-900/80 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Verify email</h1>
        {status === "pending" && <p className="text-slate-300">Verifying your token...</p>}
        {status === "success" && (
          <>
            <p className="text-emerald-200">Email verified! Ranked play is now unlocked.</p>
            <Button className="mt-4 w-full" onClick={() => router.push("/auth/login")}>
              Continue
            </Button>
          </>
        )}
        {status === "error" && (
          <p className="text-red-300">Verification failed. Request a new link from settings.</p>
        )}
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-white">Verifying...</div>}>
      <VerifyClient />
    </Suspense>
  );
}
