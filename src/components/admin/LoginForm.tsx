"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";

const messages = {
  invalid: "Email ou mot de passe incorrect.",
  locked: "Trop de tentatives. Réessayez dans 15 minutes.",
  server: "Une erreur est survenue. Réessayez.",
} as const;

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-accent";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-500" role="alert">
          {messages[state.error]}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}