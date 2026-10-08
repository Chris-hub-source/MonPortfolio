import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/actions/auth";
import AdminNav from "@/components/admin/AdminNav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  const pending = await prisma.appointment.count({
    where: { status: "PENDING", startsAt: { gte: new Date() } },
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <span className="font-display text-lg font-bold">
              Admin<span className="text-accent">.</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted sm:inline">
                {admin.email}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full border border-border px-4 py-2 text-sm transition hover:bg-background"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
          <AdminNav pending={pending} />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}