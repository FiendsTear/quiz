/**
 * This is a Next.js page.
 */
import Link from "next/link";

export default function IndexPage() {
  // const mutation = trpc.quiz.addQuiz.useMutation();
  // const query = trpc.quiz.getQuizzes.useQuery();

  // mutation.mutate("something");

  return (
    <main>
      <Link href="profile">Профиль</Link>
    </main>
  );
}
