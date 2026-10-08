import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <section className="mx-auto flex min-h-[60svh] max-w-6xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-7xl font-bold text-accent">404</p>
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
      <p className="max-w-md text-muted">{t("description")}</p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground transition hover:opacity-90"
      >
        {t("back")}
      </Link>
    </section>
  );
}