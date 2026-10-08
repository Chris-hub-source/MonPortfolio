import { prisma } from "@/lib/prisma";

export const SLOT_MINUTES = 30; // durée d'un rendez-vous
export const MIN_NOTICE_HOURS = 12; // délai minimum avant un créneau
export const MAX_DAYS_AHEAD = 45; // fenêtre de réservation

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

const parsedOffset = Number(process.env.BOOKING_UTC_OFFSET_MINUTES ?? 0);
export const UTC_OFFSET_MINUTES = Number.isFinite(parsedOffset)
  ? parsedOffset
  : 0;

// Instant UTC -> "YYYY-MM-DD" dans le fuseau du site
export function toDateKey(ms: number) {
  return new Date(ms + UTC_OFFSET_MINUTES * MIN).toISOString().slice(0, 10);
}

// Minuit local d'une date, exprimé en UTC
function dayStartUtc(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d) - UTC_OFFSET_MINUTES * MIN;
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

export type Availability = {
  today: string;
  lastDate: string;
  slots: Record<string, string[]>; // "YYYY-MM-DD" -> créneaux (ISO UTC)
};

export async function getAvailability(): Promise<Availability> {
  const now = Date.now();
  const today = toDateKey(now);
  const lastDate = toDateKey(now + MAX_DAYS_AHEAD * DAY);
  const rangeStart = dayStartUtc(today);
  const rangeEnd = dayStartUtc(lastDate) + DAY;

  // Requêtes l'une après l'autre : une seule connexion à ouvrir au lieu de trois
  const rules = await prisma.availabilityRule.findMany({
    where: { active: true },
  });
  const blocked = await prisma.blockedDate.findMany({
    where: {
      date: {
        gte: new Date(`${today}T00:00:00Z`),
        lte: new Date(`${lastDate}T00:00:00Z`),
      },
    },
  });
  const appointments = await prisma.appointment.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      startsAt: { lt: new Date(rangeEnd) },
      endsAt: { gt: new Date(rangeStart) },
    },
    select: { startsAt: true, endsAt: true },
  });

  // Une date bloquée est stockée comme minuit UTC de la date locale
  const blockedKeys = new Set(
    blocked.map((b) => b.date.toISOString().slice(0, 10)),
  );
  const busy = appointments.map(
    (a) => [a.startsAt.getTime(), a.endsAt.getTime()] as const,
  );
  const earliest = now + MIN_NOTICE_HOURS * 60 * MIN;

  const slots: Record<string, string[]> = {};

  for (let i = 0; i <= MAX_DAYS_AHEAD; i++) {
    const start = rangeStart + i * DAY;
    const key = toDateKey(start);
    if (blockedKeys.has(key)) continue;

    const weekday = new Date(start + UTC_OFFSET_MINUTES * MIN).getUTCDay();
    const day = new Set<string>();

    for (const rule of rules) {
      if (rule.weekday !== weekday) continue;
      const from = toMinutes(rule.startTime);
      const to = toMinutes(rule.endTime);

      for (let t = from; t + SLOT_MINUTES <= to; t += SLOT_MINUTES) {
        const s = start + t * MIN;
        const e = s + SLOT_MINUTES * MIN;
        if (s < earliest) continue;
        if (busy.some(([bs, be]) => bs < e && be > s)) continue;
        day.add(new Date(s).toISOString());
      }
    }

    if (day.size > 0) slots[key] = [...day].sort();
  }

  return { today, lastDate, slots };
}

export async function isSlotAvailable(iso: string) {
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) return false;
  const { slots } = await getAvailability();
  return (slots[toDateKey(ms)] ?? []).includes(new Date(ms).toISOString());
}

// Cache de 30 s pour l'affichage du calendrier. La réservation, elle,
// revérifie toujours le créneau sans cache (isSlotAvailable).
const CACHE_MS = 30_000;
let cache: { at: number; data: Availability } | null = null;
let inflight: Promise<Availability> | null = null;

export async function getAvailabilityCached(): Promise<Availability> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;

  // Plusieurs visiteurs en même temps partagent la même requête
  inflight ??= getAvailability()
    .then((data) => {
      cache = { at: Date.now(), data };
      return data;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function invalidateAvailabilityCache() {
  cache = null;
}