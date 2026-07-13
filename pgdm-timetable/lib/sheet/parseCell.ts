import type { ClassEntry } from '@/types/timetable';
import type { EventCategory } from '@/types/events';
import { EVENT_KEYWORDS, CANONICAL_SUBJECT_CODES } from './constants';

const EVENT_CATEGORY_MAP: Record<string, EventCategory> = {
  holiday: 'holiday',
  exam: 'exam',
  workshop: 'workshop',
  seminar: 'seminar',
  'guest lecture': 'guest-lecture',
  placement: 'placement',
  notice: 'notice',
};

/**
 * Checks whether a cell's text represents an event (holiday, exam, etc.)
 * rather than a regular class. Matches by substring so variants like
 * "Holiday - Eid" or "Placement Drive - Round 2" still get detected.
 */
export function detectEventCategory(cellText: string): EventCategory | null {
  const lower = cellText.trim().toLowerCase();
  if (!lower) return null;

  for (const keyword of EVENT_KEYWORDS) {
    if (lower.includes(keyword)) {
      return EVENT_CATEGORY_MAP[keyword] ?? 'other';
    }
  }
  return null;
}

// The base course code, e.g. "MK629", "MK630", "ST509".
const BASE_CODE_PATTERN = /^[A-Z]{2,4}\d{3}/;

// A single "(...)" group immediately following the code (allowing whitespace
// before it), captured one at a time so we can walk through several in a
// row — e.g. "MK630(B)(B) (CR-3)" has three: "B", "B", "CR-3".
const NEXT_GROUP_PATTERN = /^\s*\(([^)]+)\)/;

function isRoomLike(group: string): boolean {
  return /CR|CL|Tutorial/i.test(group);
}

function normalize(text: string): string {
  return text.replace(/\s+/g, '').toUpperCase();
}

// Precomputed, longest-first, so prefix matching always prefers the most
// specific known subject code (e.g. "ST509(B)(A)" over a shorter partial).
const NORMALIZED_CANONICAL = CANONICAL_SUBJECT_CODES.map((code) => ({
  original: code,
  normalized: normalize(code),
})).sort((a, b) => b.normalized.length - a.normalized.length);

/**
 * Matches a cell's course code + bracketed qualifiers against the
 * authoritative subject list (CANONICAL_SUBJECT_CODES), returning the
 * longest canonical code that is a prefix of it.
 *
 * This is how we correctly resolve subjects like "MK629(A)" vs "MK629(B)"
 * as two distinct offerings, and "MK630(B)(B)" (the real code "MK630(B)"
 * with an extra trailing qualifier) — by matching against the known list
 * instead of guessing from context. If nothing in the list matches, the
 * raw identity text is kept as-is, so no subject is ever silently dropped.
 */
function matchCanonicalCode(identityCandidate: string): string | null {
  const normalizedCandidate = normalize(identityCandidate);
  for (const { original, normalized } of NORMALIZED_CANONICAL) {
    if (normalizedCandidate.startsWith(normalized)) return original;
  }
  return null;
}

function extractCodeAndRoom(part: string): { subjectCode: string; room?: string } {
  const baseMatch = part.match(BASE_CODE_PATTERN);
  if (!baseMatch) return { subjectCode: part };

  const identityGroups: string[] = [];
  let room: string | undefined;
  let rest = part.slice(baseMatch[0].length);

  // Walk through every "(...)" group right after the code, classifying
  // each as either the room or a qualifier that's part of the subject's identity.
  let match = rest.match(NEXT_GROUP_PATTERN);
  while (match) {
    const value = match[1].trim();
    if (isRoomLike(value)) {
      room = room ?? value;
    } else {
      identityGroups.push(value);
    }
    rest = rest.slice(match[0].length);
    match = rest.match(NEXT_GROUP_PATTERN);
  }

  const identityCandidate = baseMatch[0] + identityGroups.map((g) => `(${g})`).join('');
  const subjectCode = matchCanonicalCode(identityCandidate) ?? identityCandidate;

  return { subjectCode, room };
}

/**
 * Parses a single session-slot cell into one or more class entries.
 * A slot can hold multiple parallel/alternate offerings separated by "/",
 * e.g. "MK629 (A) (CR-5)/MK630 (A) (CR-2)".
 */
export function parseSessionCell(cellText: string): ClassEntry[] {
  const trimmed = cellText.trim();
  if (!trimmed) return [];

  return trimmed
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const { subjectCode, room } = extractCodeAndRoom(part);
      return { raw: part, subjectCode, room };
    });
}
