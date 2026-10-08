import { headers } from "next/headers";

export async function getClientIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function getUserAgent() {
  const h = await headers();
  return h.get("user-agent")?.slice(0, 300) ?? null;
}
