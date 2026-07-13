const SESSION_LABELS: Record<string, string> = {
  I: 'Session I',
  II: 'Session II',
  III: 'Session III',
  LUNCH: 'Lunch',
  IV: 'Session IV',
  V: 'Session V',
  VI: 'Session VI',
};

export function sessionLabel(session: string): string {
  return SESSION_LABELS[session] ?? session;
}

/** Formats a millisecond duration as "1h 24m 03s" (or "24m 03s", or "03s"). */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
  if (minutes > 0) return `${minutes}m ${pad(seconds)}s`;
  return `${seconds}s`;
}

/** Formats a millisecond duration as "01:24:03" for the flap-digit display. */
export function formatCountdownDigits(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatDayCountdown(ms: number): string {
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
