import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { SLOT_MINUTES, toDateKey } from "@/lib/availability";
import {
  addBlockedDate,
  addRule,
  deleteBlockedDate,
  deleteRule,
  toggleRule,
} from "@/actions/admin-availability";

export const metadata: Metadata = { title: "Disponibilités" };

const DAYS = [
  { weekday: 1, label: "Lundi" },
  { weekday: 2, label: "Mardi" },
  { weekday: 3, label: "Mercredi" },
  { weekday: 4, label: "Jeudi" },
  { weekday: 5, label: "Vendredi" },
  { weekday: 6, label: "Samedi" },
  { weekday: 0, label: "Dimanche" },
];

const ok = "border-green-500/40 bg-green-500/10";
const warn = "border-amber-500/40 bg-amber-500/10";
const error = "border-red-500/40 bg-red-500/10";

const notices: Record<string, { text: string; style: string }> = {
  "rule-added": { text: "Plage horaire ajoutée.", style: ok },
  "rule-updated": { text: "Plage horaire mise à jour.", style: ok },
  "rule-deleted": { text: "Plage horaire supprimée.", style: ok },
  "date-blocked": { text: "Date bloquée.", style: ok },
  "date-unblocked": { text: "Date de nouveau disponible.", style: ok },
  "blocked-with-appointments": {
    text: "Date bloquée, mais des rendez-vous existent déjà ce jour-là. Ils ne sont pas annulés : traite-les dans l'onglet Rendez-vous.",
    style: warn,
  },
  "too-short": {
    text: `La plage doit durer au moins ${SLOT_MINUTES} minutes.`,
    style: error,
  },
  overlap: {
    text: "Cette plage chevauche une plage existante le même jour.",
    style: error,
  },
  past: { text: "Impossible de bloquer une date passée.", style: error },
  invalid: { text: "Données invalides. Réessaie.", style: error },
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent";
const smallButton =
  "rounded-full border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-background";

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();

  const { notice: noticeKey } = await searchParams;
  const notice = noticeKey ? notices[noticeKey] : undefined;

  // eslint-disable-next-line react-hooks/purity
  const todayKey = toDateKey(Date.now());
  const [rules, blocked] = await Promise.all([
    prisma.availabilityRule.findMany({
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    }),
    prisma.blockedDate.findMany({
      where: { date: { gte: new Date(`${todayKey}T00:00:00Z`) } },
      orderBy: { date: "asc" },
    }),
  ]);

  const dateFormat = new Intl.DateTimeFormat("fr", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Disponibilités</h1>
      <p className="mt-2 text-sm text-muted">
        Les créneaux proposés aux visiteurs sont de {SLOT_MINUTES} minutes, à
        l&apos;intérieur des plages ci-dessous. Les changements sont immédiats
        sur le site public.
      </p>

      {notice && (
        <p
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${notice.style}`}
          role="status"
        >
          {notice.text}
        </p>
      )}

      {/* Horaires hebdomadaires */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">Horaires de la semaine</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DAYS.map(({ weekday, label }) => {
            const dayRules = rules.filter((r) => r.weekday === weekday);
            return (
              <div
                key={weekday}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <p className="font-medium">{label}</p>
                {dayRules.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">Indisponible</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-2">
                    {dayRules.map((r) => (
                      <li
                        key={r.id}
                        className="flex flex-wrap items-center justify-between gap-2"
                      >
                        <span
                          className={`text-sm ${r.active ? "" : "text-muted line-through"}`}
                        >
                          {r.startTime} – {r.endTime}
                        </span>
                        <form className="flex gap-2">
                          <input type="hidden" name="id" value={r.id} />
                          <button formAction={toggleRule} className={smallButton}>
                            {r.active ? "Désactiver" : "Activer"}
                          </button>
                          <button
                            formAction={deleteRule}
                            className={`${smallButton} text-red-500`}
                          >
                            Supprimer
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <form
          action={addRule}
          className="mt-4 grid items-end gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4"
        >
          <div>
            <label htmlFor="weekday" className="text-xs text-muted">
              Jour
            </label>
            <select id="weekday" name="weekday" className={inputClass} defaultValue="1">
              {DAYS.map(({ weekday, label }) => (
                <option key={weekday} value={weekday}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="startTime" className="text-xs text-muted">
              De
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              defaultValue="09:00"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="endTime" className="text-xs text-muted">
              À
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue="12:00"
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            Ajouter la plage
          </button>
        </form>
      </section>

      {/* Dates bloquées */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Dates bloquées</h2>
        <p className="mt-2 text-sm text-muted">
          Congés, jours fériés, indisponibilités : ces jours n&apos;apparaissent
          plus dans le calendrier public.
        </p>

        {blocked.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Aucune date bloquée à venir.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
            {blocked.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium capitalize">
                    {dateFormat.format(b.date)}
                  </p>
                  {b.reason && <p className="text-sm text-muted">{b.reason}</p>}
                </div>
                <form>
                  <input type="hidden" name="id" value={b.id} />
                  <button formAction={deleteBlockedDate} className={smallButton}>
                    Débloquer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form
          action={addBlockedDate}
          className="mt-4 grid items-end gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3"
        >
          <div>
            <label htmlFor="date" className="text-xs text-muted">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              min={todayKey}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="reason" className="text-xs text-muted">
              Motif (facultatif)
            </label>
            <input
              id="reason"
              name="reason"
              type="text"
              maxLength={200}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            Bloquer la date
          </button>
        </form>
      </section>
    </div>
  );
}