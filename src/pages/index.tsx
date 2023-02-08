import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { getTranslations } from "../common/getTranslations";

export default function IndexPage() {
  const { t } = useTranslation("common");
  return <>{t("Profile")}</>;
}

export async function getStaticProps({ locale }: { locale: string }) {
  return getTranslations({ locale });
}
