import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState } from "react";

export default function GamesPage() {
  const { push } = useRouter();

  const gamesQuery = trpc.game.getActiveGames.useQuery();

  const [input, setInput] = useState(0);
  const mutation = trpc.game.create.useMutation({
    onSuccess: async (data) => {
      await push(`/games/${data}/host`);
    },
  });

  function handleClick() {
    mutation.mutate(input);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(+e.target.value);
  }

  function handleGameEnter(gameID: number) {
    push(`/games/${gameID}/player`).catch((err) => console.error(err));
  }

  return (
    <article>
      <input onChange={handleChange} value={input}></input>
      <button onClick={handleClick}>Новая игра</button>
      <ul>
        {gamesQuery.data?.map((game) => {
          return (
            <li key={game.id}>
              <button
                onClick={() => {
                  handleGameEnter(game.id);
                }}
              >
                Enter Game {game.id}
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
