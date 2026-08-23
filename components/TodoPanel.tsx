"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Circle, Edit3, Filter, Focus, Heart, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Todo } from "@/types/todo";

type FilterName = "all" | "active" | "completed" | "favorites";

interface TodoPanelProps {
  todos: Todo[];
  currentTaskId: string | null;
  onAdd: (title: string) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onFavorite: (id: string) => void;
  onFocus: (id: string) => void;
  compact?: boolean;
}

const filterLabels: Record<FilterName, string> = { all: "全部", active: "待完成", completed: "已完成", favorites: "收藏" };

export function TodoPanel({ todos, currentTaskId, onAdd, onEdit, onDelete, onToggle, onFavorite, onFocus, compact }: TodoPanelProps) {
  const [filter, setFilter] = useState<FilterName>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const filtered = useMemo(() => todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    if (filter === "favorites") return todo.favorite;
    return true;
  }), [filter, todos]);

  const submitAdd = () => {
    const title = draft.trim();
    if (!title) return;
    onAdd(title); setDraft(""); setAdding(false);
  };
  const submitEdit = (id: string) => {
    const title = editDraft.trim();
    if (title) onEdit(id, title);
    setEditingId(null);
  };
  const dateLabel = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "short" }).format(new Date());

  return (
    <section className={`todo-panel ${compact ? "todo-panel-mobile" : ""}`} aria-label="待办任务">
      <span className="tomato-tab" aria-hidden="true"><i /></span>
      <header className="todo-header">
        <div><h1>我的任务</h1><p>今天 · {dateLabel}</p></div>
        <div className="todo-header-actions">
          <button onClick={() => setAdding(true)} aria-label="添加任务"><Plus size={19} /> <span>添加任务</span></button>
          <div className="filter-wrap">
            <button onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen}><Filter size={18} /><span>{filterLabels[filter]}</span></button>
            <AnimatePresence>{filterOpen && (
              <motion.div className="filter-menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                {(Object.keys(filterLabels) as FilterName[]).map((name) => <button key={name} onClick={() => { setFilter(name); setFilterOpen(false); }}>{filterLabels[name]}</button>)}
              </motion.div>
            )}</AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence initial={false}>
        {adding && (
          <motion.form className="task-editor" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={(event) => { event.preventDefault(); submitAdd(); }}>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={80} placeholder="写下一件想完成的事" aria-label="新任务名称" />
            <button type="submit" disabled={!draft.trim()}><Check size={18} /></button><button type="button" onClick={() => setAdding(false)}><X size={18} /></button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div className="task-list" layout>
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((todo) => {
            const current = todo.id === currentTaskId;
            return (
              <motion.article
                layout
                key={todo.id}
                className={`task-row ${current ? "current-task" : ""} ${todo.completed ? "completed-task" : ""}`}
                initial={{ opacity: 0, y: -10, scale: .98 }} animate={{ opacity: 1, y: current ? -3 : 0, scale: 1 }} exit={{ opacity: 0, x: 24, scale: .96 }}
              >
                <button className="task-check" onClick={() => onToggle(todo.id)} aria-label={todo.completed ? `恢复任务：${todo.title}` : `完成任务：${todo.title}`}>
                  {todo.completed ? <Check size={17} /> : <Circle size={22} />}
                </button>
                <div className="task-main">
                  {editingId === todo.id ? (
                    <form onSubmit={(event) => { event.preventDefault(); submitEdit(todo.id); }}><input value={editDraft} onChange={(event) => setEditDraft(event.target.value)} onBlur={() => submitEdit(todo.id)} aria-label="编辑任务名称" /></form>
                  ) : <span className="task-title">{todo.title}</span>}
                  {current && <span className="focus-badge"><Focus size={12} /> 专注中</span>}
                </div>
                <span className="tomato-count" title="已完成番茄数"><i aria-hidden="true" />{todo.pomodoroCount}</span>
                <button className={`favorite-button ${todo.favorite ? "is-favorite" : ""}`} onClick={() => onFavorite(todo.id)} aria-label={todo.favorite ? `取消收藏：${todo.title}` : `收藏任务：${todo.title}`}><Heart size={19} fill={todo.favorite ? "currentColor" : "none"} /></button>
                <div className="task-actions">
                  {!todo.completed && <button onClick={() => onFocus(todo.id)} title="专注此任务"><Focus size={16} /></button>}
                  <button onClick={() => { setEditingId(todo.id); setEditDraft(todo.title); }} title="编辑任务"><Edit3 size={15} /></button>
                  <button onClick={() => onDelete(todo.id)} title="删除任务"><Trash2 size={15} /></button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="empty-state"><span className="empty-rabbit" aria-hidden="true">⌁</span><h2>{todos.length ? "这里暂时没有任务" : "任务清单还是空的"}</h2><p>添加一件你想专心完成的事。</p><button onClick={() => setAdding(true)}><Plus size={17} /> 添加第一个任务</button></div>
      )}
      {!!todos.length && <button className="add-task-bottom" onClick={() => setAdding(true)}><Plus size={19} /> 添加任务</button>}
      <p className="todo-footer"><Heart size={13} /> 今天也要温柔地完成计划 <RotateCcw size={12} /></p>
    </section>
  );
}
