import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import Userpic from "./Userpic";
import { useTranslation } from "next-i18next";

export default function Header() {
  const { data: sessionData } = useSession();
  const { t } = useTranslation("common");

  return (
    <header className="flex bg-emerald-400 items-center p-2">
      <section className="flex gap-2">
        <Link href="/">{t("Home")}</Link>
        <Link href="/games">{t("Games")}</Link>
      </section>
      <section className="flex grow justify-end gap-4">
        <Link className="flex items-center gap-2" href="/profile">
          {sessionData && (
            <>
              <Userpic src={sessionData.user?.image} size={32} />
              <span>{sessionData.user?.name}</span>
            </>
          )}
        </Link>
        <button
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? t("Sign out") : t("Sign in")}
        </button>
      </section>
    </header>
  );
}