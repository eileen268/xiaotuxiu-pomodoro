export type TimerMode = "focus" | "break" | "longBreak";
export type TimerStatus = "idle" | "running" | "paused";

export interface PomodoroSettings {
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  pomodorosBeforeLongBreak: number;
  autoStartFocus: boolean;
  autoStartBreak: boolean;
  longBreakEnabled: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

export interface SessionLog {
  id: string;
  mode: TimerMode;
  completedAt: string;
  taskId: string | null;
  taskTitle: string | null;
  durationMinutes: number;
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  breakMinutes: 15,
  longBreakMinutes: 30,
  pomodorosBeforeLongBreak: 4,
  autoStartFocus: false,
  autoStartBreak: false,
  longBreakEnabled: true,
  soundEnabled: true,
  animationsEnabled: true,
};
