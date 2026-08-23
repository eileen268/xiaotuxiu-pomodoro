import type { PomodoroSettings, TimerMode } from "@/types/pomodoro";

export function durationForMode(mode: TimerMode, settings: PomodoroSettings) {
  const minutes = mode === "focus"
    ? settings.focusMinutes
    : mode === "break"
      ? settings.breakMinutes
      : settings.longBreakMinutes;
  return minutes * 60;
}

export function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function clockHandEndpoint(angleDegrees: number, length: number, center = 50) {
  const radians = angleDegrees * Math.PI / 180;
  return {
    x: center + Math.sin(radians) * length,
    y: center - Math.cos(radians) * length,
  };
}

export function nextTimerMode(
  current: TimerMode,
  completedFocusesInCycle: number,
  settings: PomodoroSettings,
): TimerMode {
  if (current !== "focus") return "focus";
  const hitsLongBreak = completedFocusesInCycle >= settings.pomodorosBeforeLongBreak;
  return settings.longBreakEnabled && hitsLongBreak ? "longBreak" : "break";
}

export function modeLabel(mode: TimerMode) {
  return mode === "focus" ? "专注" : mode === "break" ? "短休息" : "长休息";
}

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

export function isSameLocalDay(iso: string, target = new Date()) {
  const date = new Date(iso);
  return date.getFullYear() === target.getFullYear()
    && date.getMonth() === target.getMonth()
    && date.getDate() === target.getDate();
}
