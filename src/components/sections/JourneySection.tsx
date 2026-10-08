import { getTranslations } from "next-intl/server";
import { education, experience } from "@/data/experience";
import { skills } from "@/data/skills";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export default async function JourneySection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Experience" });
  const lang = locale === "en" ? "en" : "fr";

  return (
    <section
      id="parcours"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6"
    >
      <Reveal className="max-w-2xl">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-muted">{t("subtitle")}</p>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <Reveal>
            <h3 className="font-display text-2xl font-bold">
              {t("experienceTitle")}
            </h3>
          </Reveal>
          <Stagger as="ol" className="mt-6 border-l border-border" stagger={0.15}>
            {experience.map((item) => (
              <StaggerItem
                as="li"
                key={item.period.fr + item.company}
                className="relative pb-10 pl-6"
              >
                <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_0_4px] shadow-accent/20" />
                <p className="text-sm text-muted">{item.period[lang]}</p>
                <h4 className="mt-1 font-display text-lg font-semibold">
                  {item.role[lang]}{" "}
                  <span className="text-muted">· {item.company}</span>
                </h4>
                <p className="mt-2 text-sm text-muted">
                  {item.description[lang]}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div>
          <Reveal>
            <h3 className="font-display text-2xl font-bold">
              {t("educationTitle")}
            </h3>
          </Reveal>
          <Stagger as="ol" className="mt-6 border-l border-border" stagger={0.15}>
            {education.map((item) => (
              <StaggerItem
                as="li"
                key={item.period.fr + item.degree.fr}
                className="relative pb-8 pl-6"
              >
                <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_0_4px] shadow-sky-400/20" />
                <p className="text-sm text-muted">{item.period[lang]}</p>
                <h4 className="mt-1 font-display text-lg font-semibold">
                  {item.degree[lang]}
                </h4>
                <p className="text-sm text-muted">{item.school}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal>
            <h3 className="mt-6 font-display text-2xl font-bold">
              {t("skillsTitle")}
            </h3>
          </Reveal>
          <Stagger className="mt-6 flex flex-col gap-5">
            {skills.map((group) => (
              <StaggerItem key={group.key}>
                <h4 className="text-sm font-medium uppercase tracking-wide text-muted">
                  {t(`skills.${group.key}`)}
                </h4>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-border bg-card px-3 py-1 text-sm transition hover:border-accent"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}