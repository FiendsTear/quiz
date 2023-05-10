import { useTranslation } from "next-i18next";

export default function Footer() {
  const { t } = useTranslation("common");
  return (
    <footer className="h-7 bg-teal-200 flex flex-row justify-end items-center px-5">
      <span>
        {t("Feedback")}: <a href="mailto:app.inquiz@gmail.com">app.inquiz@gmail.com</a>
      </span>
    </footer>
  );
}
