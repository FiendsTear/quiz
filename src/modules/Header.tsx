import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";

export default function Header() {
  const { data: sessionData } = useSession();
  const { t } = useTranslation("common");

  return (
    <header className="flex bg-emerald-400 items-center p-2">
      <section className="flex gap-2">
        <Link href="/">Home</Link>
        <Link href="/games">Games</Link>
      </section>
      <section className="flex grow justify-end gap-2">
        <Link href="/profile">{sessionData && <span>{sessionData.user?.name}</span>}</Link>
        <button
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
      </section>
    </header>
  );
}
