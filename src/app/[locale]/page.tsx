import { Fragment } from "react";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import AnchorLink from "@/components/layout/AnchorLink";
import HeroVisual from "@/components/three/HeroVisual";
import TechMarquee from "@/components/sections/TechMarque";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ServicesSection from "@/components/sections/ServicesSection";
import JourneySection from "@/components/sections/JourneySection";
import BookingSection from "@/components/booking/BookingSection";
import ContactSection from "@/components/sections/ContactSection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
       <Hero />
      <TechMarquee />
      <ProjectsSection />
      <ServicesSection locale={locale} />
      <JourneySection locale={locale} />
      <BookingSection />
      <ContactSection locale={locale} />
    </>
  );
}

function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute left-[10%] top-[-8%] h-[480px] w-[480px] rounded-full bg-accent/20 blur-3xl md:animate-float" />
      <div className="absolute right-[-8%] top-1/3 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl md:animate-float-slow" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
    </div>
  );
}

function Hero() {
  const t = useTranslations("Home");
  const title = t("title");
  const words = title.split(" ");

  // Les éléments suivants démarrent quand le titre a fini d'apparaître
  const afterTitle = 150 + words.length * 55;

  return (
    <section className="relative">
      <HeroBackground />

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <span
            className="inline-flex w-fit animate-fade-up items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-sm text-muted backdrop-blur"
          >
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            {t("available")}
          </span>

          <h1
            aria-label={title}
            className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
          >
            {words.map((word, i) => (
              <Fragment key={i}>
                <span
                  aria-hidden="true"
                  className="inline-block overflow-hidden pb-[0.12em] align-bottom -mb-[0.12em]"
                >
                  <span
                    className={`inline-block animate-word-up ${
                      i >= words.length - 2
                        ? "bg-gradient-to-r from-accent to-sky-400 bg-clip-text text-transparent"
                        : ""
                    }`}
                    style={{ animationDelay: `${150 + i * 55}ms` }}
                  >
                    {word}
                  </span>
                </span>{" "}
              </Fragment>
            ))}
          </h1>

          <p
            className="max-w-xl animate-fade-up text-lg text-muted"
            style={{ animationDelay: `${afterTitle}ms` }}
          >
            {t("subtitle")}
          </p>

         <div
  className="flex animate-fade-up flex-wrap gap-3"
  style={{ animationDelay: `${afterTitle + 120}ms` }}
>
  <AnchorLink
    id="projets"
    className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30 active:translate-y-0"
  >
    {t("seeProjects")}
    <span aria-hidden="true" className="transition group-hover:translate-x-1">
      →
    </span>
  </AnchorLink>
  <AnchorLink
    id="rendez-vous"
    className="rounded-full border border-border bg-card/60 px-6 py-3 font-medium backdrop-blur transition hover:-translate-y-0.5 hover:border-accent active:translate-y-0"
  >
    {t("bookCall")}
  </AnchorLink>
</div>
        </div>

        <div className="animate-scale-in" style={{ animationDelay: "250ms" }}>
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}