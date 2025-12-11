"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

const avatars = ["avatar-1", "avatar-2", "avatar-3", "avatar-4"];
const themes = [
  { value: "classic", label: "Classic" },
  { value: "dark", label: "Dark" },
  { value: "wood", label: "Wood" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState(avatars[0]);
  const [boardTheme, setBoardTheme] = useState(themes[0].value);
  const [timezone, setTimezone] = useState("UTC");
  const [defaultTheme, setDefaultTheme] = useState("dark");
  const steps = [
    {
      title: "Choose avatar",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {avatars.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`flex h-16 items-center justify-center rounded-xl border ${avatar === a ? "border-emerald-400 bg-emerald-500/10" : "border-white/10"}`}
            >
              {a}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Board theme",
      content: (
        <Select
          label="Choose theme"
          value={boardTheme}
          onChange={(e) => setBoardTheme(e.target.value)}
          options={themes}
        />
      ),
    },
    {
      title: "Region",
      content: (
        <Select
          label="Timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          options={[
            { value: "UTC", label: "UTC" },
            { value: "America/New_York", label: "New York" },
            { value: "Europe/Berlin", label: "Berlin" },
            { value: "Asia/Singapore", label: "Singapore" },
          ]}
        />
      ),
    },
    {
      title: "Theme preference",
      content: (
        <Select
          label="UI theme"
          value={defaultTheme}
          onChange={(e) => setDefaultTheme(e.target.value)}
          options={[
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
        />
      ),
    },
  ];

  const finish = async () => {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar, boardTheme, timezone, defaultTheme }),
    });
    if (res.ok) {
      toast.success("Onboarding saved");
      router.push("/dashboard");
    } else {
      toast.error("Unable to save onboarding");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Step {step + 1} of {steps.length}</p>
        <button className="text-sm text-slate-300 hover:text-white" onClick={() => router.push("/dashboard")}>
          Skip
        </button>
      </div>
      <h2 className="text-2xl font-semibold">{steps[step].title}</h2>
      {steps[step].content}
      <div className="flex justify-end gap-3">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {step === steps.length - 1 ? (
          <Button onClick={finish}>Finish</Button>
        ) : (
          <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
        )}
      </div>
    </div>
  );
}
