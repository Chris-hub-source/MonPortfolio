import { z } from "zod";

// Les messages sont des clés de traduction, affichées côté client
export const contactSchema = z.object({
  name: z.string().trim().min(2, "tooShort").max(100, "tooLong"),
  email: z.string().trim().email("invalidEmail").max(200, "tooLong"),
  subject: z.string().trim().min(3, "tooShort").max(150, "tooLong"),
  message: z.string().trim().min(10, "tooShort").max(3000, "tooLong"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const appointmentSchema = z.object({
  name: z.string().trim().min(2, "tooShort").max(100, "tooLong"),
  email: z.string().trim().email("invalidEmail").max(200, "tooLong"),
  subject: z.string().trim().min(3, "tooShort").max(150, "tooLong"),
  message: z.string().trim().max(2000, "tooLong"), // facultatif : peut être vide
  startsAt: z
    .string()
    .max(40)
    .refine((v) => !Number.isNaN(Date.parse(v)), "invalid"),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  // Limite haute : bcrypt coûte cher, on évite les mots de passe géants
  password: z.string().min(1).max(200),
});