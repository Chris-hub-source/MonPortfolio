"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { UTC_OFFSET_MINUTES } from "@/lib/availability";
import { sendAppointmentDecision } from "@/lib/email";

const VUES = ["pending", "upcoming", "past", "closed"];
const INTENTS = {
  confirm: "CONFIRMED",
  decline: "DECLINED",
  cancel: "CANCELLED",
} as const;

export async function updateAppointment(formData: FormData) {
  await requireAdmin(); // toujours vérifier, même si la page l'a déjà fait

  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  const vueInput = String(formData.get("vue") ?? "");
  const vue = VUES.includes(vueInput) ? vueInput : "pending";

  const back = (notice: string) =>
    redirect(`/admin/rendez-vous?vue=${vue}&notice=${notice}`);

  if (!(intent in INTENTS) || id.length < 10 || id.length > 40) {
    return back("error");
  }
  const target = INTENTS[intent as keyof typeof INTENTS];

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) return back("error");

  // Transitions autorisées : en attente -> confirmé / refusé, confirmé -> annulé
  const allowed =
    (appointment.status === "PENDING" &&
      (target === "CONFIRMED" || target === "DECLINED")) ||
    (appointment.status === "CONFIRMED" && target === "CANCELLED");
  if (!allowed) return back("error");
  if (target === "CONFIRMED" && appointment.startsAt < new Date()) {
    return back("error");
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: target, adminNote: note || appointment.adminNote },
  });

  let emailSent = true;
  try {
    await sendAppointmentDecision(
      {
        name: appointment.name,
        email: appointment.email,
        subject: appointment.subject,
        message: appointment.message,
        startsAt: appointment.startsAt,
        locale: appointment.locale,
      },
      target,
      note,
      UTC_OFFSET_MINUTES,
    );
  } catch (err) {
    console.error("Decision email failed:", err);
    emailSent = false;
  }

  return back(emailSent ? "updated" : "email-failed");
}