"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type FormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      identifier: values.identifier,
      password: values.password,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid credentials");
    } else {
      toast.success("Welcome back!");
      router.push("/dashboard");
    }
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Input
        label="Email or Username"
        placeholder="you@example.com"
        {...form.register("identifier")}
        error={form.formState.errors.identifier?.message}
        autoComplete="username"
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        {...form.register("password")}
        error={form.formState.errors.password?.message}
        autoComplete="current-password"
      />
      <label className="flex items-center gap-2 text-sm text-slate-200">
        <input type="checkbox" {...form.register("remember")} className="h-4 w-4 rounded border-white/20 bg-white/5" />
        Remember me
      </label>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
