"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import BookingWidget from "./BookingWidget";
import Reveal from "@/components/motion/Reveal";

type Availability = {
  today: string;
  lastDate: string;
  slots: Record<string, string[]>;
  offsetMinutes: number;
};

export default function BookingSection() {
  const t = useTranslations("Booking");
  const [data, setData] = useState<Availability | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading",
  );

  const load = useCallback(async () => {
    setStatus("loading");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 30_000);
    try {
      const res = await fetch("/api/availability", {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as Availability);
      setStatus("ready");
    } catch {
      setStatus("error");
    } finally {
      window.clearTimeout(timer);
    }
  }, []);

  // Préchargement : dès que le navigateur est au repos après l'affichage de la page
   useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => void load(), {
        timeout: 3000,
      });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => void load(), 1500);
    return () => clearTimeout(id);
  }, [load]);

  return (
    <section
      id="rendez-vous"
      className="scroll-mt-20 border-y border-border bg-card/40"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted">{t("subtitle")}</p>
        </Reveal>

        <div className="mt-10">
          {status === "ready" && data ? (
            <BookingWidget
              slots={data.slots}
              today={data.today}
              lastDate={data.lastDate}
              offsetMinutes={data.offsetMinutes}
            />
          ) : status === "error" ? (
            <div className="rounded-2xl border border-border bg-background p-8">
              <p className="text-muted">{t("unavailable")}</p>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-4 rounded-full border border-border px-5 py-2 text-sm font-medium transition hover:border-accent"
              >
                {t("retry")}
              </button>
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-background text-sm text-muted">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
              {t("loading")}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}