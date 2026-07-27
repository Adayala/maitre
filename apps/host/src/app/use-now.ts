import { useEffect, useState } from "react";

// A shared ticking clock for "hace N min" labels. The host/reception workflow
// cares about minute-level urgency, not per-second updates, so a coarse tick
// keeps re-renders cheap.
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
