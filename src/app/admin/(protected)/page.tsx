import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { UTC_OFFSET_MINUTES } from "@/lib/availability";
import { formatSlotLabel } from "@/lib/datetime";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  await requireAdmin();
  const now = new Date();

  const [pendingCount, upcomingCount, pending, upcoming] = await Promise.all([
    prisma.appointment.count({
      where: { status: "PENDING", startsAt: { gte: now } },
    }),
    prisma.appointment.count({
      where: { status: "CONFIRMED", startsAt: { gte: now } },
    }),
    prisma.appointment.findMany({
      where: { status: "PENDING", startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: { status: "CONFIRMED", startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      take: 5,
    }),
  ]);

  const label = (d: Date) =>
    formatSlotLabel(d.toISOString(), "fr", UTC_OFFSET_MINUTES);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Tableau de bord</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/rendez-vous?vue=pending"
          className="rounded-2xl border border-border bg-card p-5 transition hover:border-accent"
        >
          <p className="text-sm text-muted">À traiter</p>
          <p className="mt-2 font-display text-4xl font-bold text-amber-500">
            {pendingCount}
          </p>
        </Link>
        <Link
          href="/admin/rendez-vous?vue=upcoming"
          className="rounded-2xl border border-border bg-card p-5 transition hover:border-accent"
        >
          <p className="text-sm text-muted">Rendez-vous confirmés à venir</p>
          <p className="mt-2 font-display text-4xl font-bold text-green-500">
            {upcomingCount}
          </p>
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Demandes en attente</h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-muted">Rien à traiter pour le moment.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
            {pending.map((a) => (
              <li key={a.id} className="px-5 py-4">
                <p className="font-medium">{a.name}</p>
                <p className="text-sm text-muted">{label(a.startsAt)}</p>
                <p className="text-sm text-muted">{a.subject}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Prochains rendez-vous</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-muted">Aucun rendez-vous confirmé.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
            {upcoming.map((a) => (
              <li key={a.id} className="px-5 py-4">
                <p className="font-medium">{a.name}</p>
                <p className="text-sm text-muted">{label(a.startsAt)}</p>
                <p className="text-sm text-muted">{a.subject}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}