import type { DaySchedule, SessionSlot } from '@/types/timetable';
import type { ScheduleEvent } from '@/types/events';
import { DAY_HEADER_MARKER, SESSION_ORDER, SESSION_TIMES, TARGET_BATCH_PREFIX } from './constants';
import { matchTargetSection } from './matchBatch';
import { parseDateLabel } from './parseDate';
import { detectEventCategory, parseSessionCell } from './parseCell';

// Column layout (0-indexed): A=0 (seq no.), B=1 (Date & Day), C=2 (Batch and Section),
// D..J=3..9 (the 7 session slots, in SESSION_ORDER).
const COL_DATE = 1;
const COL_BATCH = 2;
const COL_SESSIONS_START = 3;

export interface ParsedSchedule {
  classes: DaySchedule[];
  events: ScheduleEvent[];
}

/**
 * Walks the raw sheet rows and produces both the class timetable and the
 * events list for the target batch, in a single pass.
 *
 * Deliberately does NOT rely on fixed row numbers or a fixed number of
 * batch rows per day — it anchors on the repeating "Date & Day" marker row
 * and the most recent non-empty date cell, so it stays correct even if
 * rows are inserted/removed or a day has a different set of batches.
 */
export function parseSchedule(rows: string[][]): ParsedSchedule {
  const classes: DaySchedule[] = [];
  const events: ScheduleEvent[] = [];

  let currentDateLabel: string | null = null;
  let currentISODate: string | null = null;

  for (const row of rows) {
    const colB = (row[COL_DATE] ?? '').trim();
    const colC = (row[COL_BATCH] ?? '').trim();

    // Skip the repeating "Date & Day / Batch and Section" header rows.
    if (colB.startsWith(DAY_HEADER_MARKER)) continue;

    // A non-empty date cell marks the start of a new day; it only appears
    // on the first batch row of that day, so we carry it forward.
    if (colB) {
      currentDateLabel = colB;
      currentISODate = parseDateLabel(colB);
    }

    if (!colC || !currentISODate || !currentDateLabel) continue;

    const section = matchTargetSection(colC);
    if (!section) continue; // not one of our target batch's sections

    const sessionCells = SESSION_ORDER.map((_, idx) =>
      (row[COL_SESSIONS_START + idx] ?? '').trim(),
    );

    // If any slot in this row says "Holiday", treat the whole day as a
    // holiday for this section rather than parsing individual slots.
    const isHoliday = sessionCells.some((cell) => detectEventCategory(cell) === 'holiday');
    if (isHoliday) {
      events.push({
        id: `${currentISODate}-${section}-holiday`,
        date: currentISODate,
        dayLabel: currentDateLabel,
        batch: TARGET_BATCH_PREFIX,
        section,
        category: 'holiday',
        title: 'Holiday',
      });
      classes.push({
        date: currentISODate,
        dayLabel: currentDateLabel,
        batch: TARGET_BATCH_PREFIX,
        section,
        isHoliday: true,
        holidayLabel: 'Holiday',
        sessions: [],
      });
      continue;
    }

    const sessions: SessionSlot[] = SESSION_ORDER.map((key, idx) => {
      const cellText = sessionCells[idx];
      const category = detectEventCategory(cellText);
      const { start, end } = SESSION_TIMES[key];

      if (category) {
        events.push({
          id: `${currentISODate}-${section}-${key}`,
          date: currentISODate!,
          dayLabel: currentDateLabel!,
          batch: TARGET_BATCH_PREFIX,
          section,
          category,
          title: cellText,
        });
        return { session: key, startTime: start, endTime: end, entries: [] };
      }

      return {
        session: key,
        startTime: start,
        endTime: end,
        entries: parseSessionCell(cellText),
      };
    });

    classes.push({
      date: currentISODate,
      dayLabel: currentDateLabel,
      batch: TARGET_BATCH_PREFIX,
      section,
      isHoliday: false,
      sessions,
    });
  }

  return { classes, events };
}
