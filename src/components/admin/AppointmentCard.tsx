import type { Appointment } from "@/generated/prisma/client";
import { updateAppointment } from "@/actions/admin-appointments";
import { UTC_OFFSET_MINUTES } from "@/lib/availability";
import { formatSlotLabel } from "@/lib/datetime";
import StatusBadge from "./StatusBadge";

export default function AppointmentCard({
  appointment: a,
  vue,
}: {
  appointment: Appointment;
  vue: string;
}) {
  const isFuture = a.startsAt > new Date();
  const canDecide = a.status === "PENDING" && isFuture;
  const canCancel = a.status === "CONFIRMED" && isFuture;

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold">{a.name}</p>
          <a
            href={`mailto:${a.email}`}
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            {a.email}
          </a>
        </div>
        <StatusBadge status={a.status} />
      </div>

      <p className="mt-4 text-sm font-medium">
        {formatSlotLabel(a.startsAt.toISOString(), "fr", UTC_OFFSET_MINUTES)}
        {!isFuture && <span className="ml-2 text-muted">· créneau passé</span>}
      </p>
      <p className="mt-2 text-sm">
        <span className="text-muted">Sujet : </span>
        {a.subject}
      </p>
      {a.message && (
        <p className="mt-2 whitespace-pre-wrap rounded-xl bg-background px-4 py-3 text-sm text-muted">
          {a.message}
        </p>
      )}
      {a.adminNote && (
        <p className="mt-2 text-sm text-muted">
          Ton message : <span className="italic">{a.adminNote}</span>
        </p>
      )}

      {(canDecide || canCancel) && (
        <form action={updateAppointment} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={a.id} />
          <input type="hidden" name="vue" value={vue} />

          <details>
            <summary className="cursor-pointer text-sm text-muted">
              Ajouter un message pour le visiteur
            </summary>
            <textarea
              name="note"
              rows={3}
              maxLength={1000}
              placeholder="Ex. : je suis indisponible ce jour-là, pouvez-vous choisir un autre créneau ?"
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </details>

          <div className="mt-4 flex flex-wrap gap-2">
            {canDecide && (
              <>
                <button
                  type="submit"
                  name="intent"
                  value="confirm"
                  className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Accepter
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="decline"
                  className="rounded-full border border-red-500/50 px-5 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
                >
                  Refuser
                </button>
              </>
            )}
            {canCancel && (
              <button
                type="submit"
                name="intent"
                value="cancel"
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-background"
              >
                Annuler le rendez-vous
              </button>
            )}
          </div>
        </form>
      )}
    </article>
  );
}