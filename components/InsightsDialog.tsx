"use client";

import { BarChart3, CheckCircle2, Clock3, Heart, Leaf, ListChecks, Target } from "lucide-react";
import type { PomodoroSettings, SessionLog } from "@/types/pomodoro";
import type { Todo } from "@/types/todo";
import { isSameLocalDay } from "@/utils/time";
import { AppDialog } from "./AppDialog";

interface InsightsDialogProps { kind: "plan" | "stats" | null; onClose: () => void; todos: Todo[]; sessions: SessionLog[]; settings: PomodoroSettings; currentTaskId: string | null; completedInCycle: number; }

export function InsightsDialog({ kind, onClose, todos, sessions, settings, currentTaskId, completedInCycle }: InsightsDialogProps) {
  const active = todos.filter((todo) => !todo.completed);
  const todayFocus = sessions.filter((session) => session.mode === "focus" && isSameLocalDay(session.completedAt));
  const totalFocus = sessions.filter((session) => session.mode === "focus");
  const current = todos.find((todo) => todo.id === currentTaskId);
  if (!kind) return null;
  return (
    <AppDialog open title={kind === "plan" ? "今日计划" : "专注统计"} onClose={onClose} className="insights-dialog">
      {kind === "plan" ? (
        <div className="plan-content">
          <div className="current-plan-card"><span><Target size={22} /></span><div><small>当前专注</small><b>{current?.title || "还没有选择任务"}</b><p>{current ? `已经为它完成 ${current.pomodoroCount} 个番茄` : "从任务列表中选择一件事开始吧"}</p></div></div>
          <section><h3><ListChecks size={18} /> 今天还要完成</h3><div className="plan-task-list">{active.slice(0, 5).map((todo) => <div key={todo.id}><span>{todo.title}</span><small>{todo.favorite && <Heart size={13} fill="currentColor" />} {todo.pomodoroCount} 个番茄</small></div>)}{!active.length && <p className="plan-empty">今天的任务都完成啦。</p>}</div></section>
          <section><h3><Leaf size={18} /> 当前循环</h3><div className="cycle-dots">{Array.from({ length: settings.pomodorosBeforeLongBreak }, (_, index) => <i className={index < completedInCycle ? "done" : ""} key={index}>{index < completedInCycle ? "✓" : index + 1}</i>)}</div><p className="cycle-note">完成 {settings.pomodorosBeforeLongBreak} 轮专注后，安排一次长休息。</p></section>
        </div>
      ) : (
        <div className="stats-content">
          <div className="stats-hero"><BarChart3 size={28} /><div><small>今天的专注时间</small><strong>{todayFocus.reduce((sum, item) => sum + item.durationMinutes, 0)}</strong><span>分钟</span></div></div>
          <div className="stats-grid"><div><Clock3 /><strong>{todayFocus.length}</strong><span>今日番茄</span></div><div><CheckCircle2 /><strong>{todos.filter((todo) => todo.completed).length}</strong><span>完成任务</span></div><div><Leaf /><strong>{totalFocus.length}</strong><span>累计番茄</span></div></div>
          <section className="recent-sessions"><h3>最近完成</h3>{totalFocus.slice(-5).reverse().map((session) => <div key={session.id}><span>{session.taskTitle || "自由专注"}</span><small>{new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(session.completedAt))}</small></div>)}{!totalFocus.length && <p>完成第一轮专注后，这里会出现你的记录。</p>}</section>
        </div>
      )}
    </AppDialog>
  );
}
