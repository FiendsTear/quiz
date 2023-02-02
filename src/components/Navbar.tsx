import Link from "next/link";
export default function NavBar() {
  return (
    <main>
      <Link href="profile">Профиль</Link>
      <br />
      <Link href="games">Игры</Link>
    </main>
  );
}
