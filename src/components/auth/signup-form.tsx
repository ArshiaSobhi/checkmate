"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type FormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Unable to create account");
      return;
    }
    toast.success("Account created. Check your email to verify.");
    router.push("/auth/login");
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Input label="Username" placeholder="grandmaster" {...form.register("username")} error={form.formState.errors.username?.message} />
      <Input label="Email" placeholder="you@example.com" {...form.register("email")} error={form.formState.errors.email?.message} />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        {...form.register("password")}
        error={form.formState.errors.password?.message}
      />
      <Input
        label="Confirm password"
        type="password"
        placeholder="••••••••"
        {...form.register("confirmPassword")}
        error={form.formState.errors.confirmPassword?.message}
      />
      <label className="flex items-center gap-2 text-sm text-slate-200">
        <input type="checkbox" {...form.register("acceptTerms")} className="h-4 w-4 rounded border-white/20 bg-white/5" />
        I agree to the Terms of Service and Privacy Policy.
      </label>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}
