import { useEffect, useState } from "react";

// A shared 1-second ticking clock. Card timers derive their elapsed time from
// this so every card advances in lockstep without each mounting its own timer.
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export type Urgency = "calm" | "warn" | "late";

// Ambient urgency thresholds (minutes since received). Independent of the
// command status colour so the two signals never collide (task §7).
export function urgencyFor(elapsedMs: number): Urgency {
  const minutes = elapsedMs / 60000;
  if (minutes >= 12) return "late";
  if (minutes >= 6) return "warn";
  return "calm";
}

// Compact mm:ss elapsed label.
export function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
