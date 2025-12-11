import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <Card className="w-full max-w-md bg-slate-900/80">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">Create account</p>
          <h1 className="text-2xl font-semibold">Join Checkmate</h1>
        </div>
        <SignupForm />
        <div className="mt-6 text-center text-sm text-slate-300">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-emerald-300">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
