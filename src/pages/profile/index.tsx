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
      <ul className="grid grid-cols-auto-200 justify-center gap-4">
        {query.data?.map((quiz) => {
          return (
            <li key={quiz.id} className="bordered hover:bg-emerald-200 gap-2">
              <Link
                href={`profile/quizzes/${quiz.id}`}
                className="flex flex-col w-full h-full justify-between box-border p-4"
              >
                <span className='block mb-1'>{quiz.name}</span>
                <span 
                  className={quiz.isPublished ? quiz.isPrivate ? 'text-fuchsia-700' : 'text-emerald-700' : 'text-gray-600' }>
                  {quiz.isPublished ? quiz.isPrivate ? 'Private' : 'Published' : 'Unpublished'}
                </span>
              </Link>
            </li>
          );
        })}
        <li className='bordered flex flex-col'>
          <button className='w-full h-full p-5' onClick={handleNewQuiz}>Сreate New Quiz</button>
        </li>
      </ul>
    </article>
  );
}
