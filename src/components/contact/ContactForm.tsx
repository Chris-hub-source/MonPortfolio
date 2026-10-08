"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { sendContact, type ContactState } from "@/actions/contact";

const initialState: ContactState = { status: "idle" };

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-base outline-none transition focus:border-accent aria-[invalid=true]:border-red-500";

export default function ContactForm() {
  const t = useTranslations("Contact");
  const [state, formAction, pending] = useActionState(
    sendContact,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <p className="font-display text-2xl font-semibold">
          {t("successTitle")}
        </p>
        <p className="mt-3 text-muted">{t("successText")}</p>
      </div>
    );
  }

  const fieldError = (name: keyof NonNullable<ContactState["fields"]>) =>
    state.fields?.[name] ? t(`errors.${state.fields[name]}`) : null;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            {t("name")}
          </label>
          <input
            id="name"
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
          <label htmlFor="email" className="text-sm font-medium">
            {t("email")}
          </label>
          <input
            id="email"
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
      </div>

      <div>
        <label htmlFor="subject" className="text-sm font-medium">
          {t("subject")}
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          defaultValue={state.values?.subject}
          aria-invalid={!!state.fields?.subject}
          className={inputClass}
        />
        {fieldError("subject") && (
          <p className="mt-1 text-sm text-red-500">{fieldError("subject")}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium">
          {t("message")}
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          defaultValue={state.values?.message}
          aria-invalid={!!state.fields?.message}
          className={inputClass}
        />
        {fieldError("message") && (
          <p className="mt-1 text-sm text-red-500">{fieldError("message")}</p>
        )}
      </div>

      {state.error === "rateLimit" && (
        <p className="text-sm text-red-500" role="alert">
          {t("formErrors.rateLimit")}
        </p>
      )}
      {state.error === "server" && (
        <p className="text-sm text-red-500" role="alert">
          {t("formErrors.server")}
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
  );
}