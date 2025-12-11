"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, description, error, ...props }, ref) => {
    return (
      <label className="flex w-full flex-col gap-2 text-sm text-slate-200">
        {label && <span className="font-medium text-white">{label}</span>}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40",
            error && "border-red-400 focus:ring-red-400/40",
            className,
          )}
          {...props}
        />
        {description && <span className="text-xs text-slate-400">{description}</span>}
        {error && <span className="text-xs text-red-300">{error}</span>}
      </label>
    );
  },
);

Input.displayName = "Input";
