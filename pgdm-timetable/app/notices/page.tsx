'use client';

import { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { NoticeList } from '@/components/events/NoticeList';
import { useSchedule } from '@/components/providers/ScheduleProvider';

export default function NoticesPage() {
  const { notices, clearNotices, initialLoading, error, refresh, section, showAllSections } =
    useSchedule();

  const effectiveSection = showAllSections ? 'A' : section;
  const scopedNotices = showAllSections
    ? notices
    : notices.filter((n) => n.section === effectiveSection);

  const classNotices = useMemo(
    () => scopedNotices.filter((n) => n.category.startsWith('class-')),
    [scopedNotices],
  );
  const eventNotices = useMemo(
    () => scopedNotices.filter((n) => n.category.startsWith('event-')),
    [scopedNotices],
  );

  return (
    <>
      <Header />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        {error && !initialLoading && <ErrorState message={error} onRetry={refresh} />}

        {initialLoading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-wide uppercase">Notice</h1>
                <p className="text-muted text-sm">
                  Auto-detected changes to the sheet, kept visible for 1 week.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={clearNotices}
                disabled={notices.length === 0}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>

            <NoticeList
              title="Class Notices"
              notices={classNotices}
              emptyTitle="No class changes"
            />
            <NoticeList
              title="Event Notices"
              notices={eventNotices}
              emptyTitle="No event changes"
            />
          </>
        )}
      </main>
    </>
  );
}
