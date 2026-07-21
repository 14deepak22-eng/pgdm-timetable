/**
 * Central config for how we read the PGDM session-schedule sheet.
 * Keeping these here (not hardcoded in parser logic) means the
 * app can be re-pointed at a new term/batch by editing this file
 * or the equivalent env vars, without touching parsing code.
 */

// Batch/section labels we care about, as they appear in column C of the sheet.
// NOTE: the sheet's own header row labels these as "Term I", but per user
// confirmation, PGDM 2025-27 A/B/C is the batch we're building this dashboard for.
export const TARGET_BATCH_PREFIX = 'PGDM 2025-27';

export const TARGET_SECTIONS = ['A', 'B', 'C'] as const;
export type TargetSection = (typeof TARGET_SECTIONS)[number];

// Credit line shown in the header. Change this if you'd like the wording
// or name updated.
export const CREATOR_CREDIT = 'Made by Deepak Kumar · 25PGDM-BHU081';

// The complete, authoritative list of subject codes offered to PGDM
// 2025-27 (across all sections), exactly as the user confirmed them.
// This is the single source of truth for two things:
//   1. lib/sheet/parseCell.ts matches raw cell text against this list to
//      correctly identify each class (e.g. distinguishing "MK629(A)" and
//      "MK629(B)" as two different offerings, rather than guessing which
//      bracket is a section marker).
//   2. The Settings page subject picker — every one of these is always
//      offered as a choice, regardless of what's been seen in the sheet
//      yet, so nothing is ever missing while data is still loading.
export const CANONICAL_SUBJECT_CODES = [
  'MK629(A)',
  'MK629(B)',
  'MK630(A)',
  'MK630(B)',
  'MK602',
  'MK618',
  'FN642',
  'MK608',
  'IS621',
  'OM606',
  'FN643',
  'OM625',
  'HR604',
  'IS618',
  'FN604',
  'MK615',
  'OB618',
  'ST509(B)(A)',
  'ST509(B)(B)',
  'ST509(B)(C)',
] as const;

// Session number -> time range, for the 2025-27 batch's grid (sheet rows 2-3).
export const SESSION_TIMES: Record<string, { start: string; end: string }> = {
  I: { start: '09:00', end: '10:30' },
  II: { start: '10:45', end: '12:15' },
  III: { start: '12:30', end: '14:00' },
  LUNCH: { start: '13:30', end: '14:30' },
  IV: { start: '15:00', end: '16:30' },
  V: { start: '16:45', end: '18:15' },
  VI: { start: '18:30', end: '20:00' },
};

// Ordered session columns as laid out left-to-right in the sheet for this batch.
export const SESSION_ORDER = ['I', 'II', 'III', 'LUNCH', 'IV', 'V', 'VI'] as const;

// Rows whose Column C text starts with this are treated as a "new day" anchor.
export const DAY_HEADER_MARKER = 'Date & Day';

// A row's session cell is treated as a full-day event/holiday if it matches this.
export const EVENT_KEYWORDS = [
  'holiday',
  'exam',
  'workshop',
  'seminar',
  'guest lecture',
  'placement',
  'notice',
];

// Regex a cell's leading text should match to be considered a "subject" entry
// (subject code = 2-4 letters followed by 3 digits, e.g. MK608, ST509).
export const SUBJECT_CODE_PATTERN = /^[A-Z]{2,4}\d{3}/;
