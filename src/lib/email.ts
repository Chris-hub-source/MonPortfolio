import { Resend } from "resend";
import type { ContactInput } from "./validators";
import { formatSlotLabel } from "./datetime"; 
import { SITE_URL } from "./site";  

// Retire les retours à la ligne pour éviter l'injection dans l'en-tête de l'email
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

type Mail = { to: string; subject: string; text: string; replyTo?: string };

async function send({ to, subject, text, replyTo }: Mail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";
  if (!apiKey) throw new Error("Email non configuré");

  // Texte brut (pas de HTML) : le contenu du visiteur ne peut rien injecter
  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    subject,
    text,
    replyTo,
  });
  if (error) throw new Error(error.message);
}

function adminAddress() {
  const to = process.env.CONTACT_TO_EMAIL;
  if (!to) throw new Error("CONTACT_TO_EMAIL manquant");
  return to;
}

export async function sendContactEmail(input: ContactInput) {
  await send({
    to: adminAddress(),
    replyTo: input.email,
    subject: `[Portfolio] ${oneLine(input.subject)}`,
    text: `De : ${oneLine(input.name)} <${input.email}>\n\n${input.message}`,
  });
}

export type AppointmentMail = {
  name: string;
  email: string;
  subject: string;
  message: string | null;
  startsAt: Date;
  locale: string;
};

// Pour toi : une nouvelle demande est arrivée
export async function notifyAdminOfAppointment(
  a: AppointmentMail,
  offsetMinutes: number,
) {
  const when = formatSlotLabel(a.startsAt.toISOString(), "fr", offsetMinutes);
  await send({
    to: adminAddress(),
    replyTo: a.email,
    subject: `[Rendez-vous] ${oneLine(a.name)} · ${when}`,
    text: [
      "Nouvelle demande de rendez-vous",
      "",
      `De : ${oneLine(a.name)} <${a.email}>`,
      `Créneau : ${when}`,
      `Sujet : ${oneLine(a.subject)}`,
      "",
      a.message ? `Message :\n${a.message}` : "(Pas de message)",
    ].join("\n"),
  });
}

// Pour le visiteur : accusé de réception
export async function acknowledgeAppointment(
  a: AppointmentMail,
  offsetMinutes: number,
) {
  const fr = a.locale !== "en";
  const when = formatSlotLabel(
    a.startsAt.toISOString(),
    fr ? "fr" : "en",
    offsetMinutes,
  );
  const name = oneLine(a.name);

  await send({
    to: a.email,
    subject: fr
      ? "Votre demande de rendez-vous a bien été reçue"
      : "Your appointment request has been received",
    text: fr
      ? `Bonjour ${name},\n\nJ'ai bien reçu votre demande de rendez-vous pour le créneau suivant :\n${when}\n\nVous recevrez un email dès qu'elle sera confirmée.\n\nÀ bientôt.`
      : `Hello ${name},\n\nI've received your appointment request for the following slot:\n${when}\n\nYou'll get an email as soon as it's confirmed.\n\nSee you soon.`,
  });
}


// Pour le visiteur : réponse à sa demande (confirmée, refusée, annulée)
export async function sendAppointmentDecision(
  a: AppointmentMail,
  decision: "CONFIRMED" | "DECLINED" | "CANCELLED",
  note: string,
  offsetMinutes: number,
) {
  const fr = a.locale !== "en";
  const when = formatSlotLabel(
    a.startsAt.toISOString(),
    fr ? "fr" : "en",
    offsetMinutes,
  );
  const name = oneLine(a.name);
  const site = SITE_URL;
  const bookingUrl = `${site}/${fr ? "fr" : "en"}#rendez-vous`;
  const noteBlock = note
    ? fr
      ? `\nMessage :\n${note}\n`
      : `\nMessage:\n${note}\n`
    : "";

  const copy = {
    CONFIRMED: fr
      ? {
          subject: "Rendez-vous confirmé",
          body: `Bonjour ${name},\n\nVotre rendez-vous est confirmé :\n${when}\n${noteBlock}\nÀ bientôt.`,
        }
      : {
          subject: "Appointment confirmed",
          body: `Hello ${name},\n\nYour appointment is confirmed:\n${when}\n${noteBlock}\nSee you soon.`,
        },
    DECLINED: fr
      ? {
          subject: "À propos de votre demande de rendez-vous",
          body: `Bonjour ${name},\n\nJe ne peux malheureusement pas honorer votre demande pour ce créneau :\n${when}\n${noteBlock}\nVous pouvez en choisir un autre ici : ${bookingUrl}\n\nMerci de votre compréhension.`,
        }
      : {
          subject: "About your appointment request",
          body: `Hello ${name},\n\nUnfortunately I can't make this slot work:\n${when}\n${noteBlock}\nYou can pick another one here: ${bookingUrl}\n\nThanks for your understanding.`,
        },
    CANCELLED: fr
      ? {
          subject: "Rendez-vous annulé",
          body: `Bonjour ${name},\n\nJe suis dans l'obligation d'annuler le rendez-vous prévu :\n${when}\n${noteBlock}\nVous pouvez réserver un nouveau créneau ici : ${bookingUrl}\n\nDésolé pour la gêne occasionnée.`,
        }
      : {
          subject: "Appointment cancelled",
          body: `Hello ${name},\n\nI have to cancel our scheduled appointment:\n${when}\n${noteBlock}\nYou can book a new slot here: ${bookingUrl}\n\nSorry for the inconvenience.`,
        },
  }[decision];

  await send({
    to: a.email,
    // Les réponses du visiteur arrivent dans ta boîte, pas sur l'adresse d'envoi
    replyTo: adminAddress(),
    subject: copy.subject,
    text: copy.body,
  });
}

// Pour toi : alerte après plusieurs échecs de connexion
export async function notifySuspiciousLogin(ip: string, email: string) {
  await send({
    to: adminAddress(),
    subject: "[Sécurité] Tentatives de connexion échouées",
    text: [
      "Plusieurs tentatives de connexion à l'administration ont échoué.",
      "",
      `Adresse IP : ${ip}`,
      `Email essayé : ${oneLine(email)}`,
      "",
      "Cette adresse IP est bloquée pendant 15 minutes.",
      "Si c'était vous, patientez avant de réessayer. Sinon, aucune action n'est nécessaire.",
    ].join("\n"),
  });
}