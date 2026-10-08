"use client";

import type { MouseEvent, ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";

export default function AnchorLink({
  id,
  className,
  children,
  onNavigate,
}: {
  id: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();
    if (pathname !== "/") return; // ailleurs : navigation normale vers /#id

    e.preventDefault();
    // Petit délai : laisse le menu mobile se refermer avant de défiler
    window.setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }, 60);
  };

  return (
    <Link href={`/#${id}`} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}