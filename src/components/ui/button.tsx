"use client";

import { Slot } from "@radix-ui/react-slot";
import { ComponentProps, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  asChild?: boolean;
};

const base =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 focus-visible:outline-emerald-500",
  secondary: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-700",
  ghost: "bg-transparent text-slate-50 hover:bg-white/5 focus-visible:outline-slate-200",
  danger: "bg-red-500 text-white hover:bg-red-400 focus-visible:outline-red-500",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(base, variants[variant], className)} {...props} />;
  },
);
Button.displayName = "Button";
