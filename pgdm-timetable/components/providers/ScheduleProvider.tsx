'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { DaySchedule, TargetSection } from '@/types/timetable';
import type { ScheduleEvent } from '@/types/events';
import { useSheetData } from '@/hooks/useSheetData';
import { useSelectedSection } from '@/hooks/useSelectedSection';
import { useSheetSource } from '@/hooks/useSheetSource';
import { useSubjectPreferences } from '@/hooks/useSubjectPreferences';
import { useShowAllSections } from '@/hooks/useShowAllSections';

interface ScheduleContextValue {
  classes: DaySchedule[];
  events: ScheduleEvent[];
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
  section: TargetSection;
  setSection: (section: TargetSection) => void;
  sheetId: string | null;
  setSheetId: (id: string | null) => void;
  selectedSubjects: string[] | null;
  setSelectedSubjects: (subjects: string[]) => void;
  showAllSections: boolean;
  setShowAllSections: (value: boolean) => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [sheetId, setSheetId] = useSheetSource();
  const sheet = useSheetData(sheetId);
  const [section, setSection] = useSelectedSection();
  const [selectedSubjects, setSelectedSubjects] = useSubjectPreferences();
  const [showAllSections, setShowAllSections] = useShowAllSections();

  return (
    <ScheduleContext.Provider
      value={{
        ...sheet,
        section,
        setSection,
        sheetId,
        setSheetId,
        selectedSubjects,
        setSelectedSubjects,
        showAllSections,
        setShowAllSections,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within a ScheduleProvider');
  return ctx;
}
