"use client";

import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
};

export function Select({ options, label, className, ...props }: SelectProps) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm text-white">
      {label && <span className="font-medium">{label}</span>}
      <select
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40",
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
