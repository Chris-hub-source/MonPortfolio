import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "@/components/admin/LoginForm";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold">
          Administration<span className="text-accent">.</span>
        </h1>
        <p className="mt-2 text-sm text-muted">Connexion réservée.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}