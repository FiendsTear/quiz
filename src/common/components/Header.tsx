import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import Userpic from "./Userpic";
import { useTranslation } from "next-i18next";

import { Rubik } from "@next/font/google";
import Button from "./Button";
import { useRouter } from "next/router";
const rubik = Rubik({ subsets: ["cyrillic", "latin"] });

export default function Header() {
  const { data: sessionData } = useSession();
  const { t } = useTranslation("common");
  const { pathname } = useRouter();
  console.log(pathname);

  return (
    <header className={`flex bg-teal-200 items-center p-2 ${rubik.className}`}>
      <section className="flex gap-2">
        <Link className="text-lg" href="/">
          inQuiz
        </Link>
        <Link
          className={
            "flex items-center" + (pathname === "/games" ? " bg-rose-300" : "")
          }
          href="/games"
        >
          {t("Games")}
        </Link>
      </section>
      <section className="flex grow justify-end gap-4">
        <Link
          className={
            "flex items-center gap-2" +
            (pathname === "/profile" ? " bg-rose-300" : "")
          }
          href="/profile"
        >
          {sessionData && (
            <>
              <span>{t("My quizzes")}</span>
              {/* there used to be user's avatar here, but since it didn't contain anything other than user's quizzes, it was reworked to make ui less confusing */}
              {/* <Userpic src={sessionData.user?.image} size={32} />
              <span>{sessionData.user?.name}</span> */}
            </>
          )}
        </Link>
        <Button
          onClick={sessionData ? () => void signOut() : () => void signIn()}
          attr={{ className: "bg-inherit shadow-none hover:bg-teal-400" }}
        >
          {sessionData ? t("Sign out") : t("Sign in")}
        </Button>
      </section>
    </header>
  );
}
