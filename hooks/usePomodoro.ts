"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PomodoroSettings, TimerMode, TimerStatus } from "@/types/pomodoro";
import { durationForMode, nextTimerMode } from "@/utils/time";

interface UsePomodoroOptions {
  settings: PomodoroSettings;
  onFocusComplete: () => void;
  onSessionComplete: (mode: TimerMode, durationMinutes: number) => void;
}

export function usePomodoro({ settings, onFocusComplete, onSessionComplete }: UsePomodoroOptions) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(() => durationForMode("focus", settings));
  const [completedFocusesInCycle, setCompletedFocusesInCycle] = useState(0);
  const targetEndRef = useRef<number | null>(null);
  const completingRef = useRef(false);
  const modeRef = useRef(mode);
  const statusRef = useRef(status);
  const remainingRef = useRef(remainingSeconds);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { remainingRef.current = remainingSeconds; }, [remainingSeconds]);

  const applyMode = useCallback((next: TimerMode, shouldRun = false) => {
    const duration = durationForMode(next, settings);
    modeRef.current = next;
    remainingRef.current = duration;
    setMode(next);
    setRemainingSeconds(duration);
    setStatus(shouldRun ? "running" : "idle");
    statusRef.current = shouldRun ? "running" : "idle";
    targetEndRef.current = shouldRun ? Date.now() + duration * 1000 : null;
  }, [settings]);

  const completeCurrentSession = useCallback(() => {
    if (completingRef.current) return;
    completingRef.current = true;
    const completedMode = modeRef.current;
    const durationMinutes = durationForMode(completedMode, settings) / 60;
    let focusCount = completedFocusesInCycle;
    if (completedMode === "focus") {
      focusCount += 1;
      onFocusComplete();
      setCompletedFocusesInCycle(focusCount >= settings.pomodorosBeforeLongBreak ? 0 : focusCount);
    }
    onSessionComplete(completedMode, durationMinutes);
    const next = nextTimerMode(completedMode, focusCount, settings);
    const autoStart = completedMode === "focus" ? settings.autoStartBreak : settings.autoStartFocus;
    applyMode(next, autoStart);
    window.setTimeout(() => { completingRef.current = false; }, 50);
  }, [applyMode, completedFocusesInCycle, onFocusComplete, onSessionComplete, settings]);

  useEffect(() => {
    if (status !== "running") return;
    const sync = () => {
      if (!targetEndRef.current) return;
      const nextRemaining = Math.max(0, (targetEndRef.current - Date.now()) / 1000);
      remainingRef.current = nextRemaining;
      setRemainingSeconds(nextRemaining);
      if (nextRemaining <= 0) completeCurrentSession();
    };
    sync();
    const timer = window.setInterval(sync, 250);
    const onVisible = () => sync();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [completeCurrentSession, status]);

  useEffect(() => {
    if (statusRef.current === "idle") {
      const duration = durationForMode(modeRef.current, settings);
      remainingRef.current = duration;
      setRemainingSeconds(duration);
    }
  }, [settings]);

  const start = useCallback(() => {
    if (statusRef.current === "running") return;
    targetEndRef.current = Date.now() + remainingRef.current * 1000;
    statusRef.current = "running";
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    if (statusRef.current !== "running") return;
    const nextRemaining = targetEndRef.current
      ? Math.max(0, (targetEndRef.current - Date.now()) / 1000)
      : remainingRef.current;
    remainingRef.current = nextRemaining;
    setRemainingSeconds(nextRemaining);
    targetEndRef.current = null;
    statusRef.current = "paused";
    setStatus("paused");
  }, []);

  const reset = useCallback(() => applyMode(modeRef.current, false), [applyMode]);
  const skip = useCallback(() => {
    const next = modeRef.current === "focus" ? "break" : "focus";
    applyMode(next, false);
  }, [applyMode]);
  const switchMode = useCallback((next: TimerMode) => applyMode(next, false), [applyMode]);

  return {
    mode, status, remainingSeconds, completedFocusesInCycle,
    start, pause, reset, skip, switchMode,
  };
}
