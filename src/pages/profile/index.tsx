import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

export default function ProfilePage() {
  const { push } = useRouter();
  const query = trpc.quiz.getUserQuizzes.useQuery();

  const mutation = trpc.quiz.addOrUpdateQuiz.useMutation();
  function handleNewQuiz() {
    mutation.mutate(
      { name: "new quiz" },
      {
        onSuccess: (data) => {
          push(`profile/quizzes/${data.id}`).catch((err) => console.error(err));
          //   query.refetch();
        },
      }
    );
  }

  if (query.isLoading) return <div>Загрузка</div>;
  return (
    <article>
      <h1>Profile</h1>
      <ul className="grid grid-cols-auto-200 justify-center">
        {query.data?.map((quiz) => {
          return (
            <li key={quiz.id} className="hover:bg-emerald-200">
              <Link
                href={`profile/quizzes/${quiz.id}`}
                className="w-full block"
              >
                {quiz.name}
              </Link>
            </li>
          );
        })}
        <li>
          <button onClick={handleNewQuiz}>Сreate New Quiz</button>
        </li>
      </ul>
    </article>
  );
}
