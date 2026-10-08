"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  today: string;
  lastDate: string;
  available: Set<string>;
  selected: string | null;
  onSelect: (dateKey: string) => void;
};

export default function Calendar({
  today,
  lastDate,
  available,
  selected,
  onSelect,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("Booking");

  const [ty, tm] = today.split("-").map(Number);
  const [ly, lm] = lastDate.split("-").map(Number);
  const minIndex = ty * 12 + (tm - 1);
  const maxIndex = ly * 12 + (lm - 1);

  const [cursor, setCursor] = useState({ y: ty, m: tm - 1 });
  const curIndex = cursor.y * 12 + cursor.m;

  const go = (delta: number) => {
    const idx = curIndex + delta;
    setCursor({ y: Math.floor(idx / 12), m: idx % 12 });
  };

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(cursor.y, cursor.m, 1)));

  // Le 1er janvier 2024 est un lundi : on construit les en-têtes à partir de là
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(
      new Date(Date.UTC(2024, 0, 1 + i)),
    ),
  );

  const offset = (new Date(Date.UTC(cursor.y, cursor.m, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const navButton =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={curIndex <= minIndex}
          aria-label={t("prevMonth")}
          className={navButton}
        >
          ←
        </button>
        <p className="font-display text-lg font-semibold capitalize">
          {monthLabel}
        </p>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={curIndex >= maxIndex}
          aria-label={t("nextMonth")}
          className={navButton}
        >
          →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs uppercase text-muted">
        {weekdays.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={`empty-${i}`} />;
          const key = `${cursor.y}-${pad(cursor.m + 1)}-${pad(d)}`;
          const isAvailable = available.has(key);
          const isSelected = selected === key;

          return (
            <button
              key={key}
              type="button"
              disabled={!isAvailable}
              aria-pressed={isSelected}
              onClick={() => onSelect(key)}
              className={`relative flex h-11 items-center justify-center rounded-xl text-sm transition ${
                isSelected
                  ? "bg-accent font-semibold text-accent-foreground"
                  : isAvailable
                    ? "border border-border hover:border-accent"
                    : "cursor-not-allowed text-muted/40"
              }`}
            >
              {d}
              {isAvailable && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-green-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}