/**
 * This is a Next.js page.
 */
import Link from "next/link";
import { trpc } from "../utils/trpc";
import { useState } from "react";
import { useRouter } from "next/router";

export default function IndexPage() {
  const { push } = useRouter();

  const gamesQuery = trpc.game.getGames.useQuery();
  const gameEnterMutation = trpc.game.enter.useMutation();

  const [input, setInput] = useState({ quizID: 1 });
  const mutation = trpc.game.create.useMutation();
  function handleClick() {
    mutation.mutate(input);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput({ quizID: +e.target.value });
  }

  function handleGameEnter(gameID: string) {
    gameEnterMutation.mutate(gameID);
    push(`/games/${gameID}`);
  }

  return (
    <main>
      <Link href="profile">Профиль</Link>
      <input onChange={handleChange}></input>
      <button onClick={handleClick}>Новая игра</button>
      <ul>
        {gamesQuery.data?.map((game) => {
          return (
            <li key={game.id}>
              <button onClick={() => handleGameEnter(game.id.toString())}>
                Enter Game {game.id}
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
