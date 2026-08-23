"use client";

import { useState } from "react";
import type { PomodoroSettings } from "@/types/pomodoro";
import { clampNumber } from "@/utils/time";
import { AppDialog } from "./AppDialog";

interface SettingsDialogProps { open: boolean; settings: PomodoroSettings; onClose: () => void; onSave: (settings: PomodoroSettings) => void; }

const durationFields: { key: keyof PomodoroSettings; label: string; min: number; max: number }[] = [
  { key: "focusMinutes", label: "专注时长", min: 1, max: 120 },
  { key: "breakMinutes", label: "短休息时长", min: 1, max: 60 },
  { key: "longBreakMinutes", label: "长休息时长", min: 1, max: 120 },
  { key: "pomodorosBeforeLongBreak", label: "长休息前的专注次数", min: 1, max: 10 },
];
const toggleFields: { key: keyof PomodoroSettings; label: string; hint: string }[] = [
  { key: "autoStartBreak", label: "自动开始休息", hint: "专注完成后直接开始休息" },
  { key: "autoStartFocus", label: "自动开始专注", hint: "休息完成后直接开始下一轮" },
  { key: "longBreakEnabled", label: "启用长休息", hint: "完成一个循环后安排更长休息" },
  { key: "soundEnabled", label: "提示音", hint: "阶段完成时播放轻柔声音" },
  { key: "animationsEnabled", label: "界面动画", hint: "保留柔和的状态与交互动画" },
];

export function SettingsDialog({ open, settings, onClose, onSave }: SettingsDialogProps) {
  const [draft, setDraft] = useState(settings);
  return (
    <AppDialog open={open} title="计时设置" onClose={onClose} className="settings-dialog">
      <form onSubmit={(event) => { event.preventDefault(); onSave(draft); onClose(); }}>
        <div className="settings-duration-grid">
          {durationFields.map(({ key, label, min, max }) => (
            <label key={key}><span>{label}</span><span className="number-input"><input type="number" inputMode="numeric" min={min} max={max} value={Number(draft[key])} onChange={(event) => setDraft((value) => ({ ...value, [key]: clampNumber(Number(event.target.value), min, max) }))} /><small>{key === "pomodorosBeforeLongBreak" ? "次" : "分钟"}</small></span></label>
          ))}
        </div>
        <div className="settings-toggle-list">
          {toggleFields.map(({ key, label, hint }) => (
            <label className="toggle-row" htmlFor={`setting-${key}`} key={key}><span><b>{label}</b><small>{hint}</small></span><input id={`setting-${key}`} aria-label={label} type="checkbox" checked={Boolean(draft[key])} onChange={(event) => setDraft((value) => ({ ...value, [key]: event.target.checked }))} /><i aria-hidden="true" /></label>
          ))}
        </div>
        <div className="dialog-actions"><button type="button" onClick={onClose}>取消</button><button className="dialog-primary" type="submit">保存设置</button></div>
      </form>
    </AppDialog>
  );
}
