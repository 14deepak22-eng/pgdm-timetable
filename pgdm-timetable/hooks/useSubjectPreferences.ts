'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pgdm-selected-subjects';

function readStored(): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : null;
  } catch {
    return null;
  }
}

/**
 * `selected: null` means "no preference saved yet — show everything".
 * An explicitly-saved empty array is treated the same way (show everything)
 * so the dashboard never goes silently blank.
 */
export function useSubjectPreferences(): [string[] | null, (subjects: string[]) => void] {
  const [selected, setSelectedState] = useState<string[] | null>(null);

  useEffect(() => {
    queueMicrotask(() => setSelectedState(readStored()));
  }, []);

  const setSelected = (subjects: string[]) => {
    setSelectedState(subjects);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    } catch {
      // Storage unavailable; selection just won't persist across visits.
    }
  };

  return [selected, setSelected];
}

export function isSubjectSelected(selected: string[] | null, subjectCode: string): boolean {
  if (!selected || selected.length === 0) return true; // no preference = show all
  return selected.includes(subjectCode);
}
