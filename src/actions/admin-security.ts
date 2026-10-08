"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const RETENTION_DAYS = 90;

export async function purgeOldLogs() {
  await requireAdmin();

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000);
  const { count } = await prisma.loginLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  redirect(`/admin/securite?notice=purged&n=${count}`);
}