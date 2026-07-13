'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pgdm-show-all-sections';

export function useShowAllSections(): [boolean, (value: boolean) => void] {
  const [value, setValueState] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        setValueState(localStorage.getItem(STORAGE_KEY) === 'true');
      } catch {
        // Ignore — falls back to per-section view.
      }
    });
  }, []);

  const setValue = (next: boolean) => {
    setValueState(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Storage unavailable; setting just won't persist across visits.
    }
  };

  return [value, setValue];
}
