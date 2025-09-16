// lib/trip-builder/core.ts
export function rid() {
  return Math.random().toString(36).slice(2, 9);
}

export function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function daysInclusive(startIso?: string, endIso?: string) {
  if (!startIso || !endIso) return 1;
  const s = new Date(startIso);
  const e = new Date(endIso);
  const ms = e.getTime() - s.getTime();
  return ms > 0 ? Math.round(ms / 86400000) + 1 : 1;
}

export function nextWeekend() {
  const today = new Date();
  const day = today.getDay(); // 0 Sun..6 Sat
  const daysUntilSat = (6 - day + 7) % 7;
  const sat = new Date(today);
  sat.setDate(today.getDate() + daysUntilSat);
  const tue = new Date(sat);
  tue.setDate(sat.getDate() + 3);
  return { start: iso(sat), end: iso(tue) };
}

export function within30Days() {
  const s = new Date();
  s.setDate(s.getDate() + 7);
  const e = new Date(s);
  e.setDate(s.getDate() + 3);
  return { start: iso(s), end: iso(e) };
}

export function iso(d: Date) {
  return d.toISOString().split("T")[0];
}
