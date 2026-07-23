// Datums-Helfer: ISO-Woche + lokales Datum (YYYY-MM-DD).

export function isoWeekKey(d: Date): string {
  // ISO-8601 Kalenderwoche. Donnerstag-Regel.
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7; // Mo=1..So=7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// Lokales Datum als YYYY-MM-DD (nicht UTC, sonst kippt der Tag abends).
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function weekdayIdx(d: Date): number {
  // 1=Mo .. 7=So
  const wd = d.getDay();
  return wd === 0 ? 7 : wd;
}
