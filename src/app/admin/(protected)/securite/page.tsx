import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { UTC_OFFSET_MINUTES } from "@/lib/availability";
import { formatDateTime } from "@/lib/datetime";
import { purgeOldLogs } from "@/actions/admin-security";

export const metadata: Metadata = { title: "Sécurité" };

// Résumé lisible du navigateur et du système à partir du user-agent
function deviceLabel(ua: string | null) {
  if (!ua) return "—";
  const os = /Windows/i.test(ua)
    ? "Windows"
    : /Android/i.test(ua)
      ? "Android"
      : /iPhone|iPad|iOS/i.test(ua)
        ? "iOS"
        : /Mac OS/i.test(ua)
          ? "macOS"
          : /Linux/i.test(ua)
            ? "Linux"
            : "Autre";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Autre";
  return `${browser} · ${os}`;
}

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; n?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const purged = params.notice === "purged" ? Number(params.n) || 0 : null;

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const last24h = new Date(now - 24 * 3_600_000);
  const last7d = new Date(now - 7 * 86_400_000);
  const last15min = new Date(now - 15 * 60_000);
  const retentionCutoff = new Date(now - 90 * 86_400_000);

  const [failed24h, success7d, recentFailsByIp, oldCount, logs] =
    await Promise.all([
      prisma.loginLog.count({
        where: { success: false, createdAt: { gte: last24h } },
      }),
      prisma.loginLog.count({
        where: { success: true, createdAt: { gte: last7d } },
      }),
      prisma.loginLog.groupBy({
        by: ["ip"],
        where: { success: false, createdAt: { gte: last15min } },
        _count: { _all: true },
      }),
      prisma.loginLog.count({ where: { createdAt: { lt: retentionCutoff } } }),
      prisma.loginLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    ]);

  const activeBlocks = recentFailsByIp.filter((r) => r._count._all >= 5).length;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Sécurité</h1>

      {purged !== null && (
        <p
          className="mt-4 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm"
          role="status"
        >
          {purged} entrée(s) de plus de 90 jours supprimée(s).
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Échecs (24 h)</p>
          <p
            className={`mt-2 font-display text-4xl font-bold ${failed24h > 0 ? "text-amber-500" : ""}`}
          >
            {failed24h}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Connexions réussies (7 jours)</p>
          <p className="mt-2 font-display text-4xl font-bold">{success7d}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Blocages actifs</p>
          <p
            className={`mt-2 font-display text-4xl font-bold ${activeBlocks > 0 ? "text-red-500" : ""}`}
          >
            {activeBlocks}
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">
          Journal des connexions
        </h2>
        <p className="mt-2 text-sm text-muted">
          Les 50 dernières tentatives. Si tu vois une connexion réussie que tu ne
          reconnais pas, change ton mot de passe sans attendre.
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3 font-medium">Appareil</th>
                <th className="px-4 py-3 font-medium">Résultat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">
                    Aucune tentative enregistrée.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatDateTime(log.createdAt, "fr", UTC_OFFSET_MINUTES)}
                  </td>
                  <td className="px-4 py-3">{log.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">{log.ip ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {deviceLabel(log.userAgent)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        log.success
                          ? "bg-green-500/15 text-green-600 dark:text-green-400"
                          : "bg-red-500/15 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {log.success ? "Réussie" : "Échec"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {oldCount > 0 && (
          <form action={purgeOldLogs} className="mt-4">
            <button
              type="submit"
              className="rounded-full border border-border px-4 py-2 text-sm transition hover:bg-card"
            >
              Supprimer les {oldCount} entrées de plus de 90 jours
            </button>
          </form>
        )}
      </section>
    </div>
  );
}