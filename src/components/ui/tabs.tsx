"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export type TabConfig = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: TabConfig[];
  defaultTab?: string;
  onChange?: (tab: string) => void;
};

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/5 bg-white/5 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActive(tab.id);
              onChange?.(tab.id);
            }}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
              active === tab.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "hover:bg-white/5",
            )}
            aria-label={tab.label}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.map(
          (tab) =>
            tab.id === active && (
              <div key={tab.id} role="tabpanel">
                {tab.content}
              </div>
            ),
        )}
      </div>
    </div>
  );
}
