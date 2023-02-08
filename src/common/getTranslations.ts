import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getTranslations({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "footer"])),
      // Will be passed to the page component as props
    },
  };
}
