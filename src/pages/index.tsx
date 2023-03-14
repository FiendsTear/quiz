import { useTranslation } from "next-i18next";
import { getTranslations } from "../common/getTranslations";

export default function IndexPage() {
  const { t } = useTranslation("common");
  return <>{t("App description")}</>;
}

export async function getStaticProps({ locale }: { locale: string }) {
  return getTranslations({ locale });
}
