import { getTranslations } from "next-intl/server";
import ContactForm from "@/components/contact/ContactForm";
import AnchorLink from "@/components/layout/AnchorLink";
import Reveal from "@/components/motion/Reveal";

export default async function ContactSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Contact" });

  return (
    <section
      id="contact"
      className="mx-auto grid max-w-6xl scroll-mt-20 gap-12 px-4 pb-24 pt-16 sm:px-6 md:grid-cols-5"
    >
      <Reveal className="md:col-span-2">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">{t("bookingHint")}</p>
          <AnchorLink
            id="rendez-vous"
            className="group mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent"
          >
            {t("bookingLink")}
            <span
              aria-hidden="true"
              className="transition group-hover:translate-x-1"
            >
              ↑
            </span>
          </AnchorLink>
        </div>
      </Reveal>

      <Reveal className="md:col-span-3" delay={0.15}>
        <ContactForm />
      </Reveal>
    </section>
  );
}