import { getTranslations } from "next-intl/server";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export default async function ServicesSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home" });
  const ts = await getTranslations({ locale, namespace: "Services" });
  const items = ts.raw("items") as { title: string; description: string }[];

  return (
    <section
      id="services"
      className="scroll-mt-20 border-y border-border bg-card/40"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {t("servicesTitle")}
          </h2>
          <p className="mt-3 text-muted">{t("servicesSubtitle")}</p>
        </Reveal>

        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <StaggerItem
              key={item.title}
              className="h-full rounded-2xl border border-border bg-background p-5 transition duration-300 hover:-translate-y-1 hover:border-accent"
            >
              <span className="font-display text-sm text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}