// src/lib/hooks/use-polling-status.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UsePollingStatusOptions<T> {
  /** Initial value, typically from SSR/server-fetched data */
  initialValue: T;
  /** Async function that fetches the latest value */
  fetcher: () => Promise<T>;
  /** Returns true when polling should stop (terminal state reached) */
  isTerminal: (value: T) => boolean;
  /** Polling interval in ms. Default 10s. */
  intervalMs?: number;
  /** Set false to disable polling entirely (e.g. feature-flag/testing) */
  enabled?: boolean;
}

interface UsePollingStatusResult<T> {
  value: T;
  isPolling: boolean;
  error: Error | null;
  /** Manually trigger a refetch outside the interval (e.g. on window focus) */
  refetch: () => Promise<void>;
}

export function usePollingStatus<T>({
  initialValue,
  fetcher,
  isTerminal,
  intervalMs = 10_000,
  enabled = true,
}: UsePollingStatusOptions<T>): UsePollingStatusResult<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(
    enabled && !isTerminal(initialValue)
  );

  // Keep latest fetcher/isTerminal in refs so the interval effect
  // doesn't need to restart every render if callers pass inline fns.
  const fetcherRef = useRef(fetcher);
  const isTerminalRef = useRef(isTerminal);
  fetcherRef.current = fetcher;
  isTerminalRef.current = isTerminal;

  const valueRef = useRef(value);
  valueRef.current = value;

  const runFetch = useCallback(async () => {
    try {
      const next = await fetcherRef.current();
      setValue(next);
      setError(null);
      if (isTerminalRef.current(next)) {
        setIsPolling(false);
      }
    } catch (err) {
      // Don't stop polling on a transient error — just surface it.
      setError(err instanceof Error ? err : new Error("Polling fetch failed"));
    }
  }, []);

  useEffect(() => {
    if (!enabled || isTerminal(initialValue)) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    const id = setInterval(() => {
      // Stop ticking once terminal — belt and suspenders alongside
      // the setIsPolling(false) inside runFetch.
      if (isTerminalRef.current(valueRef.current)) {
        clearInterval(id);
        return;
      }
      runFetch();
    }, intervalMs);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs, runFetch]);

  return { value, isPolling, error, refetch: runFetch };
}