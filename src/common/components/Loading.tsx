import { useTranslation } from "next-i18next";

export default function Loading() {
  const { t } = useTranslation("common");
  return <div>{t("Loading")}</div>;
}
