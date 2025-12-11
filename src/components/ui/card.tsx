import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode;
  subtle?: boolean;
};

export function Card({ children, className, title, actions, subtle }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-lg",
        subtle && "bg-white/3 border-white/5",
        className,
      )}
    >
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between gap-4">
          {title ? <h3 className="text-lg font-semibold text-white">{title}</h3> : <div />}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
