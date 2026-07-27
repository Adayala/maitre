import { useEffect, useState } from "react";

// A shared ticking clock for "hace N min" labels. Ticks once a minute — the
// waiter app has no second-level urgency like the KDS, so a coarse tick keeps
// re-renders cheap.
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
