import { useTranslation } from "next-i18next";
import { getTranslations } from "../common/getTranslations";
import GetCommonLayout from '../common/getCommonLayout';

export default function IndexPage() {
  const { t } = useTranslation("common");
  return <>{t("App description")}</>;
}

export async function getStaticProps({ locale }: { locale: string }) {
  return getTranslations({ locale });
}

IndexPage.getLayout = GetCommonLayout;
