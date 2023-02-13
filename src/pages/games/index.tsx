import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function GamesPage() {
  const { push } = useRouter();

  const gamesQuery = trpc.game.getActiveGames.useQuery();
  const quizQuery = trpc.quiz.getQuizzes.useQuery();

  const [input, setInput] = useState(0);
  const mutation = trpc.game.create.useMutation({
    onSuccess: (data) => {
      push(`/games/${data}/host`);
    },
  });

  function handleClick() {
    mutation.mutate(input);
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setInput(+e.target.value);
  }

  function handleGameEnter(gameID: number) {
    push(`/games/${gameID}/gateway`);
  }

  function quizSelect() {
    const options = quizQuery.data?.map((quiz) => (
      <option key={quiz.id} value={quiz.id}>{quiz.name}</option>
    ));
    if (!options || !options.length)
      return (<div>Quizzes not found</div>)
    else
      return (
        <>
          <select onChange={handleChange}>
            {options}
          </select>
          <button onClick={handleClick}>Сreate New Game</button>
        </>
      )
  }

  return (
    <article>
      <h1>Games</h1>
      {quizSelect()}
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
