import { NextResponse } from "next/server";
import { getAvailabilityCached, UTC_OFFSET_MINUTES } from "@/lib/availability";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  const ip = await getClientIp();
  if (!rateLimit(`availability:${ip}`, 30, 60_000).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const availability = await getAvailabilityCached();
    return NextResponse.json(
      { ...availability, offsetMinutes: UTC_OFFSET_MINUTES },
      {
        // En production, le réseau de diffusion garde la réponse 30 s
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    console.error("Availability failed:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}