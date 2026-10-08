"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Common");
  const pathname = usePathname();
  const router = useRouter();

  const next =
    routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: next })}
      aria-label={t("switchLanguage")}
      className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-border px-3 text-sm font-medium uppercase transition hover:bg-card"
    >
      {next}
    </button>
  );
}