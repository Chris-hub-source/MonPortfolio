import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");
  const tm = useTranslations("Meta");

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} {tm("siteName")} · {t("rights")}
        </p>
        <p>{t("builtWith")}</p>
      </div>
    </footer>
  );
}