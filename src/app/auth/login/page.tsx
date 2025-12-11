import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <Card className="w-full max-w-md bg-slate-900/80">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">Welcome back</p>
          <h1 className="text-2xl font-semibold">Sign in to Checkmate</h1>
        </div>
        <LoginForm />
        <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
          <Link href="/auth/signup" className="hover:text-white">
            Create account
          </Link>
          <Link href="/auth/forgot" className="hover:text-white">
            Forgot password?
          </Link>
        </div>
      </Card>
    </div>
  );
}
