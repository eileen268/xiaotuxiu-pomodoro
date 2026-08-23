"use client";

import { motion, useReducedMotion } from "motion/react";
import type { TimerMode, TimerStatus } from "@/types/pomodoro";
import { clockHandEndpoint, formatTime, modeLabel } from "@/utils/time";

interface AnalogClockProps {
  mode: TimerMode;
  status: TimerStatus;
  remainingSeconds: number;
  taskTitle?: string;
  animationsEnabled: boolean;
}

export function AnalogClock({ mode, status, remainingSeconds, taskTitle, animationsEnabled }: AnalogClockProps) {
  const reduceMotion = useReducedMotion();
  const animate = animationsEnabled && !reduceMotion;
  const minuteAngle = (remainingSeconds / 3600) * 360;
  const secondAngle = ((remainingSeconds % 60) / 60) * 360;
  const minuteHand = clockHandEndpoint(minuteAngle, 28);
  const secondHand = clockHandEndpoint(secondAngle, 33);
  const ticks = Array.from({ length: 60 }, (_, index) => ({
    index,
    major: index % 5 === 0,
    angle: index * 6,
  }));
  const faceLabel = `${modeLabel(mode)}，剩余 ${formatTime(remainingSeconds)}${taskTitle ? `，正在专注 ${taskTitle}` : ""}`;

  return (
    <div className={`clock-sculpture mode-${mode} ${status === "running" ? "is-running" : ""}`} aria-label={faceLabel} role="timer">
      <span className="rabbit-ear rabbit-ear-left" aria-hidden="true" />
      <span className="rabbit-ear rabbit-ear-right" aria-hidden="true" />
      <div className="clock-rim">
        <svg className="clock-svg" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="47" className="face-ring" />
          {ticks.map(({ index, major, angle }) => (
            <line key={index} x1="50" y1={major ? 5 : 6.3} x2="50" y2={major ? 9 : 8.2} className={major ? "tick-major" : "tick-minor"} transform={`rotate(${angle} 50 50)`} />
          ))}
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((number, index) => {
            const angle = (index * 30 - 90) * Math.PI / 180;
            const x = Number((50 + Math.cos(angle) * 36).toFixed(3));
            const y = Number((51.4 + Math.sin(angle) * 36).toFixed(3));
            return <text key={number} x={x} y={y} className="clock-number">{number}</text>;
          })}
          <motion.line
            x1="50"
            y1="50"
            initial={false}
            animate={{ x2: minuteHand.x, y2: minuteHand.y }}
            transition={animate && status === "running" ? { duration: .28, ease: "linear" } : { duration: 0 }}
            className="countdown-hand"
          />
          <motion.line
            x1="50"
            y1="50"
            initial={false}
            animate={{ x2: secondHand.x, y2: secondHand.y }}
            transition={animate && status === "running" ? { duration: .28, ease: "linear" } : { duration: 0 }}
            className="seconds-hand"
          />
          <circle cx="50" cy="50" r="2.5" className="center-pin-outer" />
          <circle cx="50" cy="50" r="1.2" className="center-pin-inner" />
        </svg>
        <div className="clock-center-copy">
          <strong>{modeLabel(mode)}</strong>
          <time dateTime={`PT${Math.ceil(remainingSeconds)}S`}>{formatTime(remainingSeconds)}</time>
          <small>{mode === "focus" ? "正在专注" : "好好休息"}</small>
          <p title={taskTitle}>{mode === "focus" ? (taskTitle || "选择一件想完成的事") : "让思绪慢下来"}</p>
        </div>
        <span className="clock-glint" aria-hidden="true" />
      </div>
      <span className="clock-foot clock-foot-left" /><span className="clock-foot clock-foot-right" />
    </div>
  );
}
