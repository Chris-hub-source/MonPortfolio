import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import AppointmentCard from "@/components/admin/AppointmentCard"; 
import type { Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Rendez-vous" };

const tabs = [
  { key: "pending", label: "À traiter" },
  { key: "upcoming", label: "Confirmés" },
  { key: "past", label: "Passés" },
  { key: "closed", label: "Refusés / annulés" },
] as const;

type Vue = (typeof tabs)[number]["key"];

const notices = {
  updated: {
    text: "Statut mis à jour. Le visiteur a été prévenu par email.",
    style: "border-green-500/40 bg-green-500/10",
  },
  "email-failed": {
    text: "Statut mis à jour, mais l'email n'a pas pu être envoyé au visiteur. Contacte-le directement.",
    style: "border-amber-500/40 bg-amber-500/10",
  },
  error: {
    text: "Action impossible : demande introuvable ou déjà traitée.",
    style: "border-red-500/40 bg-red-500/10",
  },
} as const;

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string; notice?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const vue: Vue = tabs.some((t) => t.key === params.vue)
    ? (params.vue as Vue)
    : "pending";
  const notice =
    params.notice && params.notice in notices
      ? notices[params.notice as keyof typeof notices]
      : null;

const now = new Date();

// Le type explicite permet à TypeScript de reconnaître "PENDING", etc. comme des statuts valides
const filters: Record<Vue, Prisma.AppointmentWhereInput> = {
  pending: { status: "PENDING", startsAt: { gte: now } },
  upcoming: { status: "CONFIRMED", startsAt: { gte: now } },
  past: { startsAt: { lt: now } },
  closed: { status: { in: ["DECLINED", "CANCELLED"] } },
};

const appointments = await prisma.appointment.findMany({
  where: filters[vue],
  orderBy: { startsAt: vue === "past" || vue === "closed" ? "desc" : "asc" },
  take: 50,
});

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Rendez-vous</h1>

      {notice && (
        <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${notice.style}`} role="status">
          {notice.text}
        </p>
      )}

      <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/rendez-vous?vue=${t.key}`}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
              vue === t.key
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-4">
        {appointments.length === 0 ? (
          <p className="text-muted">Aucune demande dans cette vue.</p>
        ) : (
          appointments.map((a) => (
            <AppointmentCard key={a.id} appointment={a} vue={vue} />
          ))
        )}
      </div>
    </div>
  );
}