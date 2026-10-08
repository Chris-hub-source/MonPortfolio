"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import AnchorLink from "./AnchorLink";
import ThemeToggle from "./ThemeToggle";
import LocaleSwitcher from "./LocaleSwitcher";

const links = [
  { id: "projets", key: "projects" },
  { id: "services", key: "services" },
  { id: "parcours", key: "experience" },
  { id: "contact", key: "contact" },
] as const;

const SECTION_IDS = ["projets", "services", "parcours", "rendez-vous", "contact"];

export default function Header() {
  const t = useTranslations("Nav");
  const tm = useTranslations("Meta");
  const tc = useTranslations("Common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  // Header transparent en haut, plus marqué dès qu'on descend
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      if (window.scrollY < 200) setActive("");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section affichée au milieu de l'écran
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  // Menu mobile : pas de défilement de la page derrière, fermeture avec Échap
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const onLogoClick = (e: React.MouseEvent) => {
    setOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.replaceState(null, "", window.location.pathname);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur transition-all duration-300 ${
          scrolled
            ? "border-border bg-background/85 shadow-lg shadow-black/5"
            : "border-transparent bg-background/40"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            onClick={onLogoClick}
            className="font-display text-xl font-bold tracking-tight"
          >
            {tm("siteName")}
            <span className="text-accent">.</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map(({ id, key }) => (
              <AnchorLink
                key={id}
                id={id}
                className={`text-sm transition hover:text-foreground ${
                  active === id ? "text-foreground" : "text-muted"
                }`}
              >
                {t(key)}
              </AnchorLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            <AnchorLink
              id="rendez-vous"
              className="hidden rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 md:inline-flex"
            >
              {t("booking")}
            </AnchorLink>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? tc("closeMenu") : tc("openMenu")}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border md:hidden"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile : hors du <header> car backdrop-blur casse le position:fixed des enfants */}
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-background px-4 py-8 md:hidden"
        >
          <nav className="flex flex-col gap-2">
            {links.map(({ id, key }) => (
              <AnchorLink
                key={id}
                id={id}
                onNavigate={() => setOpen(false)}
                className={`rounded-xl px-4 py-4 font-display text-2xl font-semibold transition hover:bg-card ${
                  active === id ? "text-accent" : "text-foreground"
                }`}
              >
                {t(key)}
              </AnchorLink>
            ))}
            <AnchorLink
              id="rendez-vous"
              onNavigate={() => setOpen(false)}
              className="mt-6 inline-flex justify-center rounded-full bg-accent px-6 py-4 text-base font-medium text-accent-foreground"
            >
              {t("booking")}
            </AnchorLink>
          </nav>
        </div>
      )}
    </>
  );
}