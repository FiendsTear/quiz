import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from 'react';
import { trpc } from "../../utils/trpc";
import type { Quiz } from '@prisma/client';
import GameSettings from "@/modules/game/GameSettings";

export default function ProfilePage() {
  const { data: sessionData } = useSession();
  const { push } = useRouter();
  const [selectedQuiz, selectQuiz] = useState<Quiz | null>(null);

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
    <article className="relative h-full">
      {selectedQuiz && (
        <GameSettings
          quiz={selectedQuiz}
          cancelSelect={() => selectQuiz(null)}
          userId={sessionData?.user.id}
        />
      )}
      <h1>Profile</h1>
      <ul className="grid grid-cols-auto-200 justify-center gap-4">
        {query.data?.map((quiz) => {
          return (
            <li 
              key={quiz.id}
              onClick={() => selectQuiz(quiz)}
              className="flex flex-col justify-between bordered hover:bg-emerald-200 cursor-pointer gap-2 p-4"
            >
              <span className='block'>{quiz.name}</span>
              <span 
                className={quiz.isPublished ? quiz.isPrivate ? 'text-fuchsia-700' : 'text-emerald-700' : 'text-gray-600' }>
                {quiz.isPublished ? quiz.isPrivate ? 'Private' : 'Published' : 'Unpublished'}
              </span>
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
