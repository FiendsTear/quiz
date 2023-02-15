import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { Quiz } from "@prisma/client";

export default function GameSettings(props: {
  quiz: Quiz;
  cancelSelect: { (): void };
}) {
  const { quiz, cancelSelect } = props;
  const { push } = useRouter();

  const mutation = trpc.game.create.useMutation({
    onSuccess: async (data) => {
      await push(`/games/${data}/host`);
    },
  });

  function createGame() {
    mutation.mutate(quiz.id);
  }

  return (
    <section className="absolute w-full h-full flex items-center justify-center isolate bg-stone-800/60">
      <form className="w-1/2 h-1/2 grid">
        <button onClick={() => cancelSelect()}>Cancel</button>
        <button type="button" onClick={() => createGame()}>
          Create game
        </button>
      </form>
    </section>
  );
}
