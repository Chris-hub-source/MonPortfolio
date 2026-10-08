const MIN = 60_000;

export function offsetLabel(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? ":" + String(m).padStart(2, "0") : ""}`;
}

// "HH:MM" dans le fuseau du site
export function timeKey(iso: string, offsetMinutes: number) {
  return new Date(new Date(iso).getTime() + offsetMinutes * MIN)
    .toISOString()
    .slice(11, 16);
}

export function formatSlotLabel(
  iso: string,
  locale: string,
  offsetMinutes: number,
) {
  const shifted = new Date(new Date(iso).getTime() + offsetMinutes * MIN);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(shifted);
  return `${date} · ${timeKey(iso, offsetMinutes)} (${offsetLabel(offsetMinutes)})`;
}

export function formatDateTime(
  date: Date,
  locale: string,
  offsetMinutes: number,
) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(date.getTime() + offsetMinutes * MIN));
}