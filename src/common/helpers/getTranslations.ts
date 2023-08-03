import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// made function here to reduce duplicated code, since this must be included in every page
export async function getTranslations({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "footer"])),
      // Will be passed to the page component as props
    },
  };
}
