'use client';

import { Header } from '@/components/layout/Header';
import { SubjectPicker } from '@/components/settings/SubjectPicker';
import { SheetSourceForm } from '@/components/settings/SheetSourceForm';
import { Card } from '@/components/ui/Card';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { useSchedule } from '@/components/providers/ScheduleProvider';
import { deriveAvailableSubjects } from '@/lib/schedule/deriveAvailableSubjects';

export default function SettingsPage() {
  const {
    classes,
    sheetId,
    setSheetId,
    selectedSubjects,
    setSelectedSubjects,
    showAllSections,
    setShowAllSections,
  } = useSchedule();
  const availableSubjects = deriveAvailableSubjects(classes);

  return (
    <>
      <Header />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6">
        <h1 className="font-display text-2xl font-bold tracking-wide uppercase">Settings</h1>

        <Card className="p-5">
          <ToggleSwitch
            checked={showAllSections}
            onChange={setShowAllSections}
            label="Show all sections"
            description="Combine Sections A, B, and C into one merged view instead of switching between them. The section switcher in the header is disabled while this is on."
          />
        </Card>

        <SubjectPicker
          availableSubjects={availableSubjects}
          selected={selectedSubjects}
          onSave={setSelectedSubjects}
        />
        <SheetSourceForm currentOverride={sheetId} onSave={setSheetId} />
      </main>
    </>
  );
}
