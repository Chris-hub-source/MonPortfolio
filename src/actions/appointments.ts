"use server";

import { hasLocale } from "next-intl";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";
import {
  isSlotAvailable,
  SLOT_MINUTES,
  UTC_OFFSET_MINUTES,
  invalidateAvailabilityCache,
} from "@/lib/availability";
import {
  acknowledgeAppointment,
  notifyAdminOfAppointment,
} from "@/lib/email";
import { routing } from "@/i18n/routing";

type FieldName = "name" | "email" | "subject" | "message";

export type BookingState = {
  status: "idle" | "success" | "error";
  error?: "validation" | "rateLimit" | "slotUnavailable" | "tooMany" | "server";
  fields?: Partial<Record<FieldName, string>>;
  values?: Record<FieldName, string>;
  startsAt?: string;
};

export async function requestAppointment(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const startsAtRaw = String(formData.get("startsAt") ?? "");

  // Champ piège : invisible pour un humain, rempli par les robots
  if (String(formData.get("hp_check") ?? "") !== "") {
    return { status: "success", startsAt: startsAtRaw };
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const ip = await getClientIp();
  if (!rateLimit(`booking:${ip}`, 3, 60 * 60 * 1000).ok) {
    return { status: "error", error: "rateLimit", values };
  }

  const parsed = appointmentSchema.safeParse({
    ...values,
    startsAt: startsAtRaw,
  });
  if (!parsed.success) {
    const fields: Partial<Record<FieldName, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "startsAt") {
        return { status: "error", error: "slotUnavailable", values };
      }
      if (typeof key === "string" && !fields[key as FieldName]) {
        fields[key as FieldName] = issue.message;
      }
    }
    return { status: "error", error: "validation", fields, values };
  }

  const data = parsed.data;
  const startsAt = new Date(data.startsAt);

  try {
    // Pas plus de 2 demandes en attente par adresse email
    const pending = await prisma.appointment.count({
      where: {
        email: data.email,
        status: "PENDING",
        startsAt: { gte: new Date() },
      },
    });
    if (pending >= 2) return { status: "error", error: "tooMany", values };

    // Le créneau a pu être pris depuis l'affichage de la page
    if (!(await isSlotAvailable(startsAt.toISOString()))) {
      return { status: "error", error: "slotUnavailable", values };
    }

    const localeInput = String(formData.get("locale") ?? "");
    const locale = hasLocale(routing.locales, localeInput)
      ? localeInput
      : routing.defaultLocale;

    await prisma.appointment.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message || null,
        startsAt,
        endsAt: new Date(startsAt.getTime() + SLOT_MINUTES * 60_000),
        locale,
      },
    });
    invalidateAvailabilityCache();

    const mail = {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message || null,
      startsAt,
      locale,
    };

    // Les emails ne doivent jamais faire échouer la réservation
    try {
      await notifyAdminOfAppointment(mail, UTC_OFFSET_MINUTES);
    } catch (err) {
      console.error("Admin notification failed:", err);
    }
    try {
      await acknowledgeAppointment(mail, UTC_OFFSET_MINUTES);
    } catch (err) {
      console.error("Visitor acknowledgement failed:", err);
    }

    return { status: "success", startsAt: startsAt.toISOString() };
  } catch (err) {
    console.error("Appointment request failed:", err);
    return { status: "error", error: "server", values };
  }
}
