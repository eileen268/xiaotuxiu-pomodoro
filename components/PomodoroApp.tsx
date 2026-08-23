"use client";

import { AnimatePresence, motion } from "motion/react";
import { BarChart3, CheckSquare2, Clock3, ListTodo, Pause, Play, RotateCcw, Settings, SkipForward, Sparkles, Target } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePomodoro } from "@/hooks/usePomodoro";
import { DEFAULT_SETTINGS, type PomodoroSettings, type SessionLog, type TimerMode } from "@/types/pomodoro";
import type { Todo } from "@/types/todo";
import { formatTime, modeLabel } from "@/utils/time";
import { AnalogClock } from "./AnalogClock";
import { InsightsDialog } from "./InsightsDialog";
import { ModeSwitcher } from "./ModeSwitcher";
import { SettingsDialog } from "./SettingsDialog";
import { TodoPanel } from "./TodoPanel";

type DesktopDialog = "plan" | "stats" | null;
type MobilePage = "timer" | "tasks";

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function playCompletionTone(mode: TimerMode) {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const notes = mode === "focus" ? [523.25, 659.25, 783.99] : [659.25, 587.33, 523.25];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, context.currentTime + index * .16);
      gain.gain.linearRampToValueAtTime(.075, context.currentTime + index * .16 + .025);
      gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + index * .16 + .5);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + index * .16);
      oscillator.stop(context.currentTime + index * .16 + .52);
    });
    window.setTimeout(() => void context.close(), 1200);
  } catch { /* Audio is an optional enhancement. */ }
}

export function PomodoroApp() {
  const [todos, setTodos] = useLocalStorage<Todo[]>("xiaotuxiu.todos", []);
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>("xiaotuxiu.settings", DEFAULT_SETTINGS);
  const [currentTaskId, setCurrentTaskId] = useLocalStorage<string | null>("xiaotuxiu.currentTask", null);
  const [sessions, setSessions] = useLocalStorage<SessionLog[]>("xiaotuxiu.sessions", []);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [desktopDialog, setDesktopDialog] = useState<DesktopDialog>(null);
  const [mobilePage, setMobilePage] = useState<MobilePage>("timer");
  const [toast, setToast] = useState<{ message: string; deleted?: { todo: Todo; index: number } } | null>(null);

  const currentTask = useMemo(() => todos.find((todo) => todo.id === currentTaskId) || null, [currentTaskId, todos]);

  const incrementCurrentTask = useCallback(() => {
    if (!currentTaskId) return;
    setTodos((items) => items.map((todo) => todo.id === currentTaskId ? { ...todo, pomodoroCount: todo.pomodoroCount + 1, updatedAt: new Date().toISOString() } : todo));
  }, [currentTaskId, setTodos]);

  const recordSession = useCallback((completedMode: TimerMode, durationMinutes: number) => {
    const task = todos.find((todo) => todo.id === currentTaskId);
    const log: SessionLog = { id: createId(), mode: completedMode, completedAt: new Date().toISOString(), taskId: task?.id || null, taskTitle: task?.title || null, durationMinutes };
    setSessions((items) => [...items, log].slice(-500));
    if (settings.soundEnabled) playCompletionTone(completedMode);
    setToast({ message: completedMode === "focus" ? "专注完成，去休息一下吧" : "休息结束，准备好继续了吗" });
  }, [currentTaskId, setSessions, settings.soundEnabled, todos]);

  const timer = usePomodoro({ settings, onFocusComplete: incrementCurrentTask, onSessionComplete: recordSession });
  useEffect(() => {
    document.title = `${formatTime(timer.remainingSeconds)} · ${modeLabel(timer.mode)} · 小兔咻`;
  }, [timer.mode, timer.remainingSeconds]);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), toast.deleted ? 6000 : 3500);
    return () => window.clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (currentTaskId && !todos.some((todo) => todo.id === currentTaskId)) setCurrentTaskId(null);
  }, [currentTaskId, setCurrentTaskId, todos]);

  const addTodo = (title: string) => {
    const now = new Date().toISOString();
    const todo: Todo = { id: createId(), title, completed: false, favorite: false, pomodoroCount: 0, createdAt: now, updatedAt: now };
    setTodos((items) => [...items, todo]);
    setToast({ message: "任务已经加入清单" });
  };
  const editTodo = (id: string, title: string) => setTodos((items) => items.map((todo) => todo.id === id ? { ...todo, title, updatedAt: new Date().toISOString() } : todo));
  const toggleTodo = (id: string) => {
    setTodos((items) => items.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() } : todo));
    const target = todos.find((todo) => todo.id === id);
    if (target && !target.completed) {
      if (currentTaskId === id) setCurrentTaskId(null);
      setToast({ message: "完成一件事，真不错" });
    }
  };
  const favoriteTodo = (id: string) => setTodos((items) => items.map((todo) => todo.id === id ? { ...todo, favorite: !todo.favorite, updatedAt: new Date().toISOString() } : todo));
  const deleteTodo = (id: string) => {
    const index = todos.findIndex((todo) => todo.id === id);
    if (index < 0) return;
    const todo = todos[index];
    setTodos((items) => items.filter((item) => item.id !== id));
    if (currentTaskId === id) setCurrentTaskId(null);
    setToast({ message: "任务已删除", deleted: { todo, index } });
  };
  const undoDelete = () => {
    if (!toast?.deleted) return;
    const { todo, index } = toast.deleted;
    setTodos((items) => { const next = [...items]; next.splice(Math.min(index, next.length), 0, todo); return next; });
    setToast({ message: "任务已经恢复" });
  };
  const focusTodo = (id: string) => {
    setCurrentTaskId(id);
    timer.switchMode("focus");
    setMobilePage("timer");
    setToast({ message: "已设为当前专注任务" });
  };

  const greeting = new Date().getHours() < 12 ? "早上好" : new Date().getHours() < 18 ? "下午好" : "晚上好";
  const navItems = [
    { id: "focus", label: "专注", icon: Target },
    { id: "plan", label: "计划", icon: CheckSquare2 },
    { id: "stats", label: "统计", icon: BarChart3 },
    { id: "settings", label: "设置", icon: Settings },
  ] as const;

  return (
    <main className={`pomodoro-app theme-${timer.mode} ${settings.animationsEnabled ? "" : "custom-reduced-motion"}`}>
      <div className="ambient-shape ambient-one" /><div className="ambient-shape ambient-two" />
      <header className="app-topbar">
        <a className="brand" href="#main-workspace" aria-label="小兔咻番茄钟首页"><span className="rabbit-logo" aria-hidden="true"><i /><i /><b><u /><u /></b></span><span>小兔咻</span></a>
        <nav className="desktop-nav" aria-label="主要功能">
          {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={id === "focus" && !desktopDialog && !settingsOpen ? "active" : ""} onClick={() => id === "settings" ? setSettingsOpen(true) : id === "focus" ? setDesktopDialog(null) : setDesktopDialog(id)}><Icon size={18} strokeWidth={1.8} />{label}</button>)}
        </nav>
        <div className="mobile-quick-actions"><button onClick={() => setDesktopDialog("stats")} aria-label="统计"><BarChart3 size={20} /></button><button onClick={() => setSettingsOpen(true)} aria-label="设置"><Settings size={21} /></button></div>
      </header>

      <section id="main-workspace" className={`main-workspace mobile-page-${mobilePage}`}>
        <section className="timer-section" aria-label="番茄计时器">
          <div className="welcome-line"><span><Sparkles size={16} /> {greeting}</span><p>{currentTask ? "一次只做一件事。" : "准备好开始专注了吗？"}</p></div>
          <AnalogClock mode={timer.mode} status={timer.status} remainingSeconds={timer.remainingSeconds} taskTitle={currentTask?.title} animationsEnabled={settings.animationsEnabled} />
          <div className="timer-controls">
            <button className="secondary-control" onClick={timer.reset}><RotateCcw size={19} /><span>重置</span></button>
            <motion.button whileTap={settings.animationsEnabled ? { scale: .97, y: 1 } : undefined} className="primary-control" onClick={timer.status === "running" ? timer.pause : timer.start}>{timer.status === "running" ? <Pause size={23} fill="currentColor" /> : <Play size={23} fill="currentColor" />}<span>{timer.status === "running" ? "暂停" : timer.status === "paused" ? "继续" : "开始"}</span></motion.button>
            <button className="secondary-control" onClick={timer.skip}><SkipForward size={20} /><span>跳过</span></button>
          </div>
          <ModeSwitcher mode={timer.mode} settings={settings} onChange={timer.switchMode} />
          <p className="screen-reader-status" aria-live="polite">{modeLabel(timer.mode)}剩余约 {Math.ceil(timer.remainingSeconds / 60)} 分钟，计时器{timer.status === "running" ? "运行中" : timer.status === "paused" ? "已暂停" : "尚未开始"}</p>
        </section>
        <div className="desktop-todo"><TodoPanel todos={todos} currentTaskId={currentTaskId} onAdd={addTodo} onEdit={editTodo} onDelete={deleteTodo} onToggle={toggleTodo} onFavorite={favoriteTodo} onFocus={focusTodo} /></div>
        <div className="mobile-todo"><TodoPanel compact todos={todos} currentTaskId={currentTaskId} onAdd={addTodo} onEdit={editTodo} onDelete={deleteTodo} onToggle={toggleTodo} onFavorite={favoriteTodo} onFocus={focusTodo} /></div>
      </section>

      <nav className="mobile-bottom-nav" aria-label="手机端页面">
        <button className={mobilePage === "timer" ? "active" : ""} onClick={() => setMobilePage("timer")}><Clock3 size={22} /><span>计时</span></button>
        <button className={mobilePage === "tasks" ? "active" : ""} onClick={() => setMobilePage("tasks")}><ListTodo size={22} /><span>任务</span>{todos.filter((todo) => !todo.completed).length > 0 && <i>{todos.filter((todo) => !todo.completed).length}</i>}</button>
      </nav>

      {settingsOpen && <SettingsDialog open settings={settings} onClose={() => setSettingsOpen(false)} onSave={setSettings} />}
      <InsightsDialog kind={desktopDialog} onClose={() => setDesktopDialog(null)} todos={todos} sessions={sessions} settings={settings} currentTaskId={currentTaskId} completedInCycle={timer.completedFocusesInCycle} />
      <AnimatePresence>{toast && <motion.div className="app-toast" role="status" initial={{ opacity: 0, y: 20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 10, x: "-50%" }}><span>{toast.message}</span>{toast.deleted && <button onClick={undoDelete}>撤销</button>}</motion.div>}</AnimatePresence>
    </main>
  );
}
