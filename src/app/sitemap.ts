import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL as site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: `${site}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 1,
    alternates: {
      languages: { fr: `${site}/fr`, en: `${site}/en` },
    },
  }));
}