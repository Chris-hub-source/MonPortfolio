import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// À appeler dans chaque page et chaque action de l'admin
export const requireAdmin = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  // Si le compte est supprimé de la base, la session devient invalide
  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, email: true },
  });
  if (!admin) redirect("/admin/login");

  return admin;
});