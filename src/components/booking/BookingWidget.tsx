"use client";

import { useActionState, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import AnchorLink from "@/components/layout/AnchorLink";
import { requestAppointment, type BookingState } from "@/actions/appointments";
import { formatSlotLabel, offsetLabel, timeKey } from "@/lib/datetime";
import Calendar from "./Calendar";

type Props = {
  slots: Record<string, string[]>;
  today: string;
  lastDate: string;
  offsetMinutes: number;
};

const initialState: BookingState = { status: "idle" };

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-accent aria-[invalid=true]:border-red-500";

export default function BookingWidget({
  slots,
  today,
  lastDate,
  offsetMinutes,
}: Props) {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    requestAppointment,
    initialState,
  );
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  const available = useMemo(() => new Set(Object.keys(slots)), [slots]);
  const daySlots = date ? (slots[date] ?? []) : [];

  if (available.size === 0) {
    return (
      <div className="rounded-2xl border border-border bg-background p-8">
        <p className="text-muted">{t("noAvailability")}</p>
        <AnchorLink
          id="contact"
          className="mt-4 inline-block font-medium text-accent underline-offset-4 hover:underline"
        >
          {t("contactLink")} →
        </AnchorLink>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-background p-8">
        <p className="font-display text-2xl font-semibold">
          {t("successTitle")}
        </p>
        {state.startsAt && (
          <p className="mt-3 font-medium text-accent">
            {formatSlotLabel(state.startsAt, locale, offsetMinutes)}
          </p>
        )}
        <p className="mt-3 text-muted">{t("successText")}</p>
      </div>
    );
  }

  const fieldError = (name: "name" | "email" | "subject" | "message") =>
    state.fields?.[name] ? t(`errors.${state.fields[name]}`) : null;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Étape 1 : le jour */}
      <div className="min-w-0">
        <h3 className="mb-4 font-display text-xl font-semibold">{t("step1")}</h3>
        <Calendar
          today={today}
          lastDate={lastDate}
          available={available}
          selected={date}
          onSelect={(d) => {
            setDate(d);
            setSlot(null);
          }}
        />
        <p className="mt-3 text-sm text-muted">
          {t("timezoneNote", { tz: offsetLabel(offsetMinutes) })}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-8">
        {/* Étape 2 : l'heure */}
        <div>
          <h3 className="mb-4 font-display text-xl font-semibold">{t("step2")}</h3>
          {!date ? (
            <p className="text-muted">{t("noDate")}</p>
          ) : (
            <div
              key={date}
              className="grid animate-fade-up grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2"
            >
              {daySlots.map((iso) => (
                <button
                  key={iso}
                  type="button"
                  aria-pressed={slot === iso}
                  onClick={() => setSlot(iso)}
                  className={`h-11 whitespace-nowrap rounded-xl border px-2 text-sm font-medium transition ${
                    slot === iso
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border hover:border-accent"
                  }`}
                >
                  {timeKey(iso, offsetMinutes)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Étape 3 : les informations */}
        {slot && (
          <form
            action={formAction}
            className="flex animate-fade-up flex-col gap-5"
            noValidate
          >
            <h3 className="font-display text-xl font-semibold">{t("step3")}</h3>
            <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
              <span className="text-muted">{t("selectedSlot")} : </span>
              <span className="font-medium">
                {formatSlotLabel(slot, locale, offsetMinutes)}
              </span>
            </p>

            <input type="hidden" name="startsAt" value={slot} />
            <input type="hidden" name="locale" value={locale} />

            {/* Champ piège anti-spam */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label>
                Leave empty
                <input
                  type="text"
                  name="hp_check"
                  tabIndex={-1}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
              </label>
            </div>

            <div>
              <label htmlFor="b-name" className="text-sm font-medium">
                {t("name")}
              </label>
              <input
                id="b-name"
                name="name"
                type="text"
                autoComplete="name"
                defaultValue={state.values?.name}
                aria-invalid={!!state.fields?.name}
                className={inputClass}
              />
              {fieldError("name") && (
                <p className="mt-1 text-sm text-red-500">{fieldError("name")}</p>
              )}
            </div>

            <div>
              <label htmlFor="b-email" className="text-sm font-medium">
                {t("email")}
              </label>
              <input
                id="b-email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.values?.email}
                aria-invalid={!!state.fields?.email}
                className={inputClass}
              />
              {fieldError("email") && (
                <p className="mt-1 text-sm text-red-500">{fieldError("email")}</p>
              )}
            </div>

            <div>
              <label htmlFor="b-subject" className="text-sm font-medium">
                {t("subject")}
              </label>
              <input
                id="b-subject"
                name="subject"
                type="text"
                defaultValue={state.values?.subject}
                aria-invalid={!!state.fields?.subject}
                className={inputClass}
              />
              {fieldError("subject") && (
                <p className="mt-1 text-sm text-red-500">
                  {fieldError("subject")}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="b-message" className="text-sm font-medium">
                {t("message")}{" "}
                <span className="font-normal text-muted">{t("optional")}</span>
              </label>
              <textarea
                id="b-message"
                name="message"
                rows={4}
                defaultValue={state.values?.message}
                aria-invalid={!!state.fields?.message}
                className={inputClass}
              />
              {fieldError("message") && (
                <p className="mt-1 text-sm text-red-500">
                  {fieldError("message")}
                </p>
              )}
            </div>

            {state.error && state.error !== "validation" && (
              <p className="text-sm text-red-500" role="alert">
                {t(`formErrors.${state.error}`)}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60 sm:w-fit"
            >
              {pending ? t("sending") : t("send")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}