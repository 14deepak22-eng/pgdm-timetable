import type { DaySchedule } from '@/types/timetable';
import { CANONICAL_SUBJECT_CODES } from '@/lib/sheet/constants';

/**
 * Returns the full list of subjects to offer in the Settings picker:
 * the complete, authoritative CANONICAL_SUBJECT_CODES list (always shown
 * in full, so nothing is ever missing even before the sheet has loaded),
 * plus any extra codes actually found in the parsed schedule that aren't
 * already in that list — a safety net in case a new subject gets added
 * to the sheet later.
 */
export function deriveAvailableSubjects(days: DaySchedule[]): string[] {
  const known = new Set<string>(CANONICAL_SUBJECT_CODES);
  const extras = new Set<string>();

  for (const day of days) {
    if (day.isHoliday) continue;
    for (const slot of day.sessions) {
      for (const entry of slot.entries) {
        if (entry.subjectCode && !known.has(entry.subjectCode)) {
          extras.add(entry.subjectCode);
        }
      }
    }
  }

  return [...CANONICAL_SUBJECT_CODES, ...Array.from(extras).sort((a, b) => a.localeCompare(b))];
}
