"use client";

import { Coffee, Leaf, MoonStar } from "lucide-react";
import { motion } from "motion/react";
import type { PomodoroSettings, TimerMode } from "@/types/pomodoro";

interface ModeSwitcherProps {
  mode: TimerMode;
  settings: PomodoroSettings;
  onChange: (mode: TimerMode) => void;
}

const modes: { id: TimerMode; label: string; icon: typeof Leaf; key: keyof PomodoroSettings }[] = [
  { id: "focus", label: "专注", icon: Leaf, key: "focusMinutes" },
  { id: "break", label: "短休息", icon: Coffee, key: "breakMinutes" },
  { id: "longBreak", label: "长休息", icon: MoonStar, key: "longBreakMinutes" },
];

export function ModeSwitcher({ mode, settings, onChange }: ModeSwitcherProps) {
  return (
    <div className="mode-switcher" role="tablist" aria-label="计时模式">
      {modes.map(({ id, label, icon: Icon, key }) => (
        <button key={id} role="tab" aria-selected={mode === id} className={mode === id ? "mode-active" : ""} onClick={() => onChange(id)}>
          {mode === id && <motion.span className="mode-active-bg" layoutId="mode-active" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
          <Icon size={18} strokeWidth={1.8} /><span><b>{label}</b><small>{String(settings[key])} 分钟</small></span>
        </button>
      ))}
    </div>
  );
}
