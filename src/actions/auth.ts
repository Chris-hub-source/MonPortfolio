"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { getClientIp, getUserAgent } from "@/lib/security";
import { createSession, deleteSession } from "@/lib/session";
import { notifySuspiciousLogin } from "@/lib/email";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_IP = 5;
const MAX_FAILS_PER_EMAIL = 10;

export type LoginState = { error?: "invalid" | "locked" | "server" };

// Hash factice : on fait toujours un compare bcrypt, que le compte existe ou non,
// pour que le temps de réponse ne révèle pas si l'email est le bon
let dummyHash: string | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("not-a-real-password", 12));

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { error: "invalid" };

  const { email, password } = parsed.data;
  const ip = await getClientIp();
  const userAgent = await getUserAgent();
  const since = new Date(Date.now() - WINDOW_MS);

  try {
    const [failsByIp, failsByEmail] = await Promise.all([
      prisma.loginLog.count({
        where: { success: false, ip, createdAt: { gte: since } },
      }),
      prisma.loginLog.count({
        where: { success: false, email, createdAt: { gte: since } },
      }),
    ]);
    if (failsByIp >= MAX_FAILS_PER_IP || failsByEmail >= MAX_FAILS_PER_EMAIL) {
      return { error: "locked" };
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    const valid = await bcrypt.compare(
      password,
      admin?.passwordHash ?? getDummyHash(),
    );

    if (!admin || !valid) {
      await prisma.loginLog.create({
        data: { email, ip, userAgent, success: false },
      });
      // Alerte au moment où le seuil est atteint
      if (failsByIp + 1 === MAX_FAILS_PER_IP) {
        notifySuspiciousLogin(ip, email).catch((err) =>
          console.error("Alerte de sécurité non envoyée:", err),
        );
      }
      return { error: "invalid" };
    }

    await prisma.loginLog.create({
      data: { email, ip, userAgent, success: true },
    });
    await createSession(admin.id);
  } catch (err) {
    console.error("Login failed:", err);
    return { error: "server" };
  }

  redirect("/admin"); // hors du try : redirect fonctionne en levant une exception
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}