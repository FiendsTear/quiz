import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import type { Quiz } from "@prisma/client";

export default function GameSettings(props: {
  quiz: Quiz;
  cancelSelect: { (): void };
  userId?: string
}) {
  const { quiz, cancelSelect, userId } = props;
  const { push } = useRouter();

  const mutation = trpc.game.create.useMutation({
    onSuccess: async (data) => {
      await push(`/games/${data}/host`);
    },
  });

  function createGame() {
    mutation.mutate(quiz.id);
  }

  function editQuiz() {
    push(`profile/quizzes/${quiz.id}`).catch((err) => console.error(err));
  }

  return (
    <section className="absolute w-full h-full flex items-center justify-center isolate bg-stone-800/60">
      <form className="w-1/2 h-1/2 grid gap-4">
        <button onClick={() => cancelSelect()}>Cancel</button>
        {userId && userId === quiz.userId && (
          <button type="button" onClick={() => editQuiz()}>
            Edit Quiz
          </button>
        )}
        {quiz.isPublished && (
          <button type="button" onClick={() => createGame()}>
            Create game
          </button>
        )}
      </form>
    </section>
  );
}
