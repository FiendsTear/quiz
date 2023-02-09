import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function GamesPage() {
  const { push } = useRouter();
  const { data: sessionData } = useSession();

  const gamesQuery = trpc.game.getGames.useQuery();
  const gameEnterMutation = trpc.game.enter.useMutation();

  const [input, setInput] = useState({ quizID: 1 });
  const mutation = trpc.game.create.useMutation({
    onSuccess: (data) => {
      push(`/games/${data.id}/host`);
    },
  });
  function handleClick() {
    mutation.mutate(input);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput({ quizID: +e.target.value });
  }

  function handleGameEnter(gameID: number) {
    gameEnterMutation.mutate(gameID);
    push(`/games/${gameID}`);
  }

  return (
    <article>
      <input onChange={handleChange} value={input.quizID}></input>
      <button onClick={handleClick}>Новая игра</button>
      <ul>
        {gamesQuery.data?.map((game) => {
          return (
            <li key={game.id}>
              <button onClick={() => handleGameEnter(game.id)}>
                Enter Game {game.id}
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
