import Link from "next/link";
import { trpc } from "../../utils/trpc";

export default function ProfilePage() {
  const query = trpc.quiz.getQuizzes.useQuery();

  if (query.isLoading) return <div>Загрузка</div>;
  return (
    <article>
      <h1>Профиль</h1>
      <ul>
        {query.data?.map((quiz) => {
          return <li key={quiz.id}>{quiz.name}</li>;
        })}
      </ul>
      <Link href="profile/newQuiz">Новый квиз</Link>
    </article>
  );
}
