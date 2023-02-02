import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

export default function ProfilePage() {
  const router = useRouter();
  const query = trpc.quiz.getQuizzes.useQuery();

  const mutation = trpc.quiz.addOrUpdateQuiz.useMutation();
  function handleNewQuiz() {
    mutation.mutate(
      { name: "new quiz" },
      {
        onSuccess: (data) => {
          // router.push(`profile/quizzes/${data.id}`);
          query.refetch();
        },
      }
    );
  }

  if (query.isLoading) return <div>Загрузка</div>;
  return (
    <article>
      <h1>Профиль</h1>
      <ul>
        {query.data?.map((quiz) => {
          return (
            <li key={quiz.id}>
              <Link href={`profile/quizzes/${quiz.id}`}>{quiz.name}</Link>
            </li>
          );
        })}
      </ul>
      <button onClick={handleNewQuiz}>Сreate New Quiz</button>
    </article>
  );
}
