"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { projects, type ProjectKind } from "@/data/projects";
import Reveal from "@/components/motion/Reveal";

type Filter = "all" | ProjectKind;

const LIMIT = 3; // nombre de cartes visibles avant « Afficher tout »
const KINDS: ProjectKind[] = ["real", "study", "other"];

export default function ProjectsSection() {
  const t = useTranslations("Projects");
  const lang = useLocale() === "en" ? "en" : "fr";
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState(false);

  // Seuls les filtres qui contiennent au moins un projet sont proposés
  const filters: Filter[] = [
    "all",
    ...KINDS.filter((k) => projects.some((p) => p.kind === k)),
  ];
  const countOf = (f: Filter) =>
    f === "all" ? projects.length : projects.filter((p) => p.kind === f).length;

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.kind === filter);
  const visible = expanded ? filtered : filtered.slice(0, LIMIT);

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setExpanded(false);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="projets"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6"
      >
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-muted">{t("subtitle")}</p>
          </div>

          {filtered.length > LIMIT && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-accent"
            >
              {expanded
                ? t("showLess")
                : t("showAll", { count: filtered.length })}
              <span
                aria-hidden="true"
                className={`transition ${expanded ? "rotate-180" : ""}`}
              >
                ↓
              </span>
            </button>
          )}
        </Reveal>

        {filters.length > 2 && (
          <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => changeFilter(f)}
                aria-pressed={filter === f}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                  filter === f
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {t(`filters.${f}`)}
                <span className="ml-1.5 text-xs opacity-70">{countOf(f)}</span>
              </button>
            ))}
          </div>
        )}

        <motion.div
          layout
          className="mt-8 grid gap-6 md:grid-cols-2"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((p) => {
              const title = p.title[lang];
              return (
                <motion.article
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className={`group relative flex flex-col rounded-3xl border border-border bg-card p-3 transition-colors duration-300 ${
                    p.demo
                      ? "hover:border-accent hover:shadow-xl hover:shadow-accent/10"
                      : ""
                  }`}
                >
                  {/* Capture d'écran */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-accent/30 to-sky-400/20">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={title}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span
                          aria-hidden="true"
                          className="font-display text-8xl font-bold text-foreground/15"
                        >
                          {title.charAt(0)}
                        </span>
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-900 shadow-sm">
                      {t(`kinds.${p.kind}`)}
                    </span>

                    {p.demo && (
                      <span
                        aria-hidden="true"
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-900 opacity-0 shadow-sm transition duration-300 group-hover:opacity-100"
                      >
                        ↗
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 px-3 pb-3 pt-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-2xl font-semibold">
                        {p.demo ? (
                          // Lien étendu : toute la carte devient cliquable
                          <a
                            href={p.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="after:absolute after:inset-0 after:rounded-3xl after:content-['']"
                          >
                            {title}
                            <span className="sr-only"> ({t("opensInNewTab")})</span>
                          </a>
                        ) : (
                          title
                        )}
                      </h3>
                      {p.year && (
                        <span className="text-sm text-muted">{p.year}</span>
                      )}
                    </div>

                    <p className="text-muted">{p.description[lang]}</p>

                    {p.tech.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {p.tech.map((tech) => (
                          <li
                            key={tech}
                            className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm"
                          >
                            {tech}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-sm font-medium">
                      {p.demo ? (
                        <span className="text-accent">{t("visitSite")} ↗</span>
                      ) : (
                        <span className="rounded-full bg-muted/15 px-3 py-1 text-xs text-muted">
                          {t("private")}
                        </span>
                      )}
                     
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>
    </MotionConfig>
  );
}