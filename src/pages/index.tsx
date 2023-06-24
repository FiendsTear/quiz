import { useTranslation } from "next-i18next";
import { getTranslations } from "../common/helpers/getTranslations";
import GetCommonLayout from '../common/getCommonLayout';

export default function IndexPage() {
  const { t } = useTranslation("common");
  return <p className="text-center w-2/3 mx-auto">{t("App description")}</p>;
}

export async function getStaticProps({ locale }: { locale: string }) {
  return getTranslations({ locale });
}

IndexPage.getLayout = GetCommonLayout;
