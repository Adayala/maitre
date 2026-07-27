import { createContext, useContext, useState, type ReactNode } from "react";

// The waiter app is multi-screen (unlike the single-screen KDS) but the flow is
// a simple linear drill-down: floor → visit → order. Rather than pull in a
// router, we model navigation as a small screen stack with push/pop, which maps
// naturally to a mobile back button and keeps the dependency surface minimal.
export type Screen =
  | { name: "floor" }
  | { name: "visit"; visitId: string }
  | { name: "order"; visitId: string; orderId: string };

interface NavState {
  current: Screen;
  canGoBack: boolean;
  push: (screen: Screen) => void;
  back: () => void;
  resetToFloor: () => void;
}

const NavContext = createContext<NavState | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Screen[]>([{ name: "floor" }]);

  function push(screen: Screen) {
    setStack((s) => [...s, screen]);
  }
  function back() {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }
  function resetToFloor() {
    setStack([{ name: "floor" }]);
  }

  const current = stack[stack.length - 1]!;
  return (
    <NavContext.Provider value={{ current, canGoBack: stack.length > 1, push, back, resetToFloor }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav(): NavState {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}
