"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  SLOT_MINUTES,
  UTC_OFFSET_MINUTES,
  toDateKey,
} from "@/lib/availability";

const back = (notice: string) => redirect(`/admin/disponibilites?notice=${notice}`);

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const ruleSchema = z.object({
  weekday: z.string().regex(/^[0-6]$/).transform(Number),
  startTime: time,
  endTime: time,
});

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

const validId = (id: string) => id.length >= 10 && id.length <= 40;

export async function addRule(formData: FormData) {
  await requireAdmin();

  const parsed = ruleSchema.safeParse({
    weekday: String(formData.get("weekday") ?? ""),
    startTime: String(formData.get("startTime") ?? ""),
    endTime: String(formData.get("endTime") ?? ""),
  });
  if (!parsed.success) return back("invalid");

  const { weekday, startTime, endTime } = parsed.data;
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (end - start < SLOT_MINUTES) return back("too-short");

  const existing = await prisma.availabilityRule.findMany({ where: { weekday } });
  const overlaps = existing.some(
    (r) => start < toMinutes(r.endTime) && end > toMinutes(r.startTime),
  );
  if (overlaps) return back("overlap");

  await prisma.availabilityRule.create({ data: { weekday, startTime, endTime } });
  return back("rule-added");
}

export async function toggleRule(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!validId(id)) return back("invalid");

  const rule = await prisma.availabilityRule.findUnique({ where: { id } });
  if (!rule) return back("invalid");

  await prisma.availabilityRule.update({
    where: { id },
    data: { active: !rule.active },
  });
  return back("rule-updated");
}

export async function deleteRule(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!validId(id)) return back("invalid");

  await prisma.availabilityRule.deleteMany({ where: { id } });
  return back("rule-deleted");
}

export async function addBlockedDate(formData: FormData) {
  await requireAdmin();

  const date = String(formData.get("date") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 200);
  if (!isValidDateKey(date)) return back("invalid");
  if (date < toDateKey(Date.now())) return back("past");

  // Y a-t-il déjà des rendez-vous ce jour-là ? On prévient sans les annuler
  const [y, m, d] = date.split("-").map(Number);
  const dayStart = Date.UTC(y, m - 1, d) - UTC_OFFSET_MINUTES * 60_000;
  const clashes = await prisma.appointment.count({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      startsAt: { gte: new Date(dayStart), lt: new Date(dayStart + 86_400_000) },
    },
  });

  // Une date bloquée est stockée comme minuit UTC de la date locale
  const stored = new Date(`${date}T00:00:00Z`);
  await prisma.blockedDate.upsert({
    where: { date: stored },
    update: { reason: reason || null },
    create: { date: stored, reason: reason || null },
  });

  return back(clashes > 0 ? "blocked-with-appointments" : "date-blocked");
}

export async function deleteBlockedDate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!validId(id)) return back("invalid");

  await prisma.blockedDate.deleteMany({ where: { id } });
  return back("date-unblocked");
}