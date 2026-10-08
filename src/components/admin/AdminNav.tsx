"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/rendez-vous", label: "Rendez-vous" },
  { href: "/admin/disponibilites", label: "Disponibilités" },
  { href: "/admin/securite", label: "Sécurité" },
];
export default function AdminNav({ pending }: { pending: number }) {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {links.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
            {href === "/admin/rendez-vous" && pending > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-black">
                {pending}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
