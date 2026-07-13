# PGDM 2025-27 Session Board

A live, auto-refreshing dashboard for the PGDM 2025-27 (Sections A/B/C) class
schedule and events, sourced directly from a Google Sheet. Built with
Next.js (App Router), TypeScript, and Tailwind CSS v4.

## Features

- **Live session board** — split-flap-style countdown to the current or next class
- **Today's classes** and a **weekly timetable** grid, filterable by subject code
- **Settings page** — choose which of your subjects to show on the dashboard, and
  point the app at a different Google Sheet without redeploying (both saved
  in your browser)
- **Events** page — today / upcoming / previous, filterable by category, with
  a one-click "add to Google Calendar" link
- Dark/light theme (persisted), installable as a **PWA** with basic offline support
- Auto-refreshes from the Google Sheet every 5 minutes

## Getting started

```bash
npm install
cp .env.example .env.local   # already done in this repo; edit values if needed
npm run dev
```

Open http://localhost:3000.

## Configuration

All configuration lives in `.env.local` (see `.env.example`):

| Variable                          | Purpose                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SHEET_ID`            | The Google Sheet's ID (from its URL)                               |
| `SHEET_TAB_NAME`                  | Specific tab name to read (optional — defaults to the first sheet) |
| `NEXT_PUBLIC_REFRESH_INTERVAL_MS` | Client polling interval (default 5 minutes)                        |

**The source sheet must be shared as "Anyone with the link can view."** No
API key or "Publish to web" step is required — data is read via Google's
public `gviz` JSON endpoint.

Batch/section filtering, subject codes, and session time grids are defined
in `lib/sheet/constants.ts` — edit there if the target batch or term changes.

## Project structure

```
app/                  Routes: dashboard (/), events (/events), API (/api/sheet)
components/           UI, grouped by layout / dashboard / events / shared / ui / providers
hooks/                useSheetData, useCountdown, useLiveClock, useSelectedSection
lib/sheet/            Google Sheet fetching + parsing (the core parsing logic)
lib/schedule/         Pure derivation functions (stats, countdown status, event buckets)
lib/utils/            Formatting helpers, calendar links, className merging
types/                Shared TypeScript types
public/               Manifest, icons, service worker
```

## Deploying to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In Vercel, **Add New Project** → import the repository.
3. Vercel auto-detects Next.js — no build command changes needed.
4. Add the environment variables from `.env.example` under **Project Settings → Environment Variables**.
5. Deploy. The `/api/sheet` route revalidates every 5 minutes automatically (ISR-style caching).

## Notes

- The app polls `/api/sheet`, which itself fetches and caches the Google
  Sheet server-side — the sheet is never fetched directly from the browser.
- If the sheet's structure changes (new columns, renamed batches), the
  parsing logic in `lib/sheet/` is written to key off content (the
  repeating "Date & Day" marker row, the batch/section text) rather than
  fixed row/column numbers, so it should tolerate rows being added or removed.
