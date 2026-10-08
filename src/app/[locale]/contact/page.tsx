import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ContactForm from "@/components/contact/ContactForm";
import Reveal from "@/components/motion/Reveal";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-5">
      {/* Les classes de colonne sont sur Reveal : c'est lui l'élément de la grille */}
      <Reveal className="md:col-span-2">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">{t("bookingHint")}</p>
          <Link
            href="/rendez-vous"
            className="group mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent"
          >
            {t("bookingLink")}
            <span
              aria-hidden="true"
              className="transition group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </Reveal>

      <Reveal className="md:col-span-3" delay={0.15}>
        <ContactForm />
      </Reveal>
    </section>
  );
}