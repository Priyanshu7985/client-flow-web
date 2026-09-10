"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "clientflow-theme";

/* ---- external stores (read without effects) ---- */

function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("clientflow-theme-change", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("clientflow-theme-change", cb);
  };
}

function readMode(): ThemeMode {
  try {
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
  } catch {
    return "system";
  }
}

function subscribeSystem(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(subscribeStorage, readMode, () => "system" as ThemeMode);
  const systemDark = useSyncExternalStore(
    subscribeSystem,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );

  const resolved: "light" | "dark" =
    mode === "system" ? (systemDark ? "dark" : "light") : mode;

  // Layout effect: applies before paint and re-applies after React's dev
  // Strict-Mode remount clears the class the inline script set.
  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  const setMode = useCallback((next: ThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("clientflow-theme-change"));
  }, []);

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
