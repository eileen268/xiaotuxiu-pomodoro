"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      // Hydrate after mount so server and first client markup remain identical.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved !== null) setValue(JSON.parse(saved) as T);
    } catch {
      // Invalid or unavailable storage should never block the app.
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private browsing and full storage are handled by keeping state in memory.
    }
  }, [hydrated, key, value]);

  return [value, setValue, hydrated] as const;
}
