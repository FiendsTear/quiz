import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";

export default function NavBar() {
  const { data: sessionData } = useSession();
  return (
    <main className="flex bg-emerald-400">
      <section className="flex gap-2">
        <Link href="/profile">Profile</Link>
        <Link href="/games">Games</Link>
      </section>
      <section className="flex grow justify-end gap-2">
        <p>{sessionData && <span>{sessionData.user?.name}</span>}</p>
        <button
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
      </section>
    </main>
  );
}
