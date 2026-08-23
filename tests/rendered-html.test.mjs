import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { clockHandEndpoint, durationForMode, formatTime, nextTimerMode } from "../utils/time.ts";

const settings = {
  focusMinutes: 25, breakMinutes: 15, longBreakMinutes: 30,
  pomodorosBeforeLongBreak: 4, autoStartFocus: false, autoStartBreak: false,
  longBreakEnabled: true, soundEnabled: true, animationsEnabled: true,
};

test("formats timer values without layout-changing width", () => {
  assert.equal(formatTime(1500), "25:00");
  assert.equal(formatTime(89.1), "01:30");
  assert.equal(formatTime(-1), "00:00");
});

test("keeps clock hand endpoints rotating around the dial center", () => {
  const top = clockHandEndpoint(0, 28);
  const right = clockHandEndpoint(90, 28);
  const bottom = clockHandEndpoint(180, 28);

  assert.deepEqual(top, { x: 50, y: 22 });
  assert.ok(Math.abs(right.x - 78) < 1e-10);
  assert.ok(Math.abs(right.y - 50) < 1e-10);
  assert.ok(Math.abs(bottom.x - 50) < 1e-10);
  assert.equal(bottom.y, 78);
});

test("resolves mode durations from settings", () => {
  assert.equal(durationForMode("focus", settings), 1500);
  assert.equal(durationForMode("break", settings), 900);
  assert.equal(durationForMode("longBreak", settings), 1800);
});

test("enters a long break only after the configured focus cycle", () => {
  assert.equal(nextTimerMode("focus", 1, settings), "break");
  assert.equal(nextTimerMode("focus", 4, settings), "longBreak");
  assert.equal(nextTimerMode("longBreak", 0, settings), "focus");
  assert.equal(nextTimerMode("focus", 4, { ...settings, longBreakEnabled: false }), "break");
});

test("ships the product metadata and GitHub Pages workflow", async () => {
  const [layout, app, workflow] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/PomodoroApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /小兔咻/);
  assert.match(app, /xiaotuxiu\.todos/);
  assert.match(app, /mobile-bottom-nav/);
  assert.match(workflow, /deploy-pages@v4/);
  assert.doesNotMatch(layout, /codex-preview|Starter Project/);
});
