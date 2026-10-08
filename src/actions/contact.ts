"use server";

import { contactSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";
import { sendContactEmail } from "@/lib/email";

type FieldName = "name" | "email" | "subject" | "message";

export type ContactState = {
  status: "idle" | "success" | "error";
  error?: "validation" | "rateLimit" | "server";
  fields?: Partial<Record<FieldName, string>>;
  values?: Record<FieldName, string>;
};

// Logs de diagnostic, uniquement en développement
const debug = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "production") console.warn("[contact]", ...args);
};

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Champ piège : invisible pour un humain, rempli par les robots
  if (String(formData.get("hp_check") ?? "") !== "") {
    debug("ignoré : champ anti-spam rempli");
    return { status: "success" };
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const ip = await getClientIp();
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000).ok) {
    debug("refusé : limite de requêtes atteinte");
    return { status: "error", error: "rateLimit", values };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const fields: Partial<Record<FieldName, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as FieldName;
      if (key && !fields[key]) fields[key] = issue.message;
    }
    debug("refusé : validation", fields);
    return { status: "error", error: "validation", fields, values };
  }

  try {
    await sendContactEmail(parsed.data);
  } catch (err) {
    console.error("Contact email failed:", err);
    return { status: "error", error: "server", values };
  }

  debug("email envoyé");
  return { status: "success" };
}