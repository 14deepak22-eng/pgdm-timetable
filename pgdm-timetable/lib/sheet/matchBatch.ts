import type { TargetSection } from '@/types/timetable';
import { TARGET_BATCH_PREFIX, TARGET_SECTIONS } from './constants';

/**
 * The sheet's batch labels are inconsistently formatted, e.g.:
 *   "PGDM 2025-27 -A", "PGDM 2025-27- B", "PGDM 2025-27 -C"
 * We normalize by stripping all whitespace before matching, so spacing
 * quirks don't cause silent data loss.
 */
function normalize(label: string): string {
  return label.replace(/\s+/g, '').toUpperCase();
}

function normalizedBatchPrefix(): string {
  return normalize(TARGET_BATCH_PREFIX);
}

/**
 * Returns the section ('A' | 'B' | 'C') if the given "Batch and Section"
 * cell text belongs to the target batch, otherwise null.
 */
export function matchTargetSection(batchCellText: string): TargetSection | null {
  const normalized = normalize(batchCellText);
  const prefix = normalizedBatchPrefix();
  if (!normalized.startsWith(prefix)) return null;

  const remainder = normalized.slice(prefix.length).replace(/^-+/, '');
  const section = remainder.charAt(0) as TargetSection;
  return (TARGET_SECTIONS as readonly string[]).includes(section) ? section : null;
}
