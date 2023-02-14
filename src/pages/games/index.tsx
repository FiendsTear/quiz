import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState } from "react";

export default function GamesPage() {
  const { push } = useRouter();

  const gamesQuery = trpc.game.getActiveGames.useQuery();
  const quizQuery = trpc.quiz.getQuizzes.useQuery();

  const mutation = trpc.game.create.useMutation({
    onSuccess: async (data) => {
      await push(`/games/${data}/host`);
    },
  });

  function handleClick(quizID: number) {
    mutation.mutate(quizID);
  }

  function handleGameEnter(gameID: number) {
    push(`/games/${gameID}/player`).catch((err) => console.error(err));
  }

  function quizSelect() {
    const items = quizQuery.data?.map((quiz) => (
      <li key={quiz.id} value={quiz.id} className="flex flex-col justify-between border border-solid border-emerald-500 rounded-lg gap-2 p-4">
        {quiz.name}
        <div className="flex gap-2">
          <button>Singleplayer</button>
          <button onClick={() => handleClick(quiz.id)}>Multiplayer</button>
        </div>
      </li>
    ));
    if (!items || !items.length)
      return (
        <div>Quizzes not found</div>
      )
    else
      return (
        <ul className="grid grid-cols-auto-200 gap-4 justify-center">
          {items}
        </ul>
      )
  }

  function gameSelect() {
    const items = gamesQuery.data?.map((game) => (        
      <li key={game.id}>
        <button onClick={() => handleGameEnter(game.id)}>
          Enter Game {game.id}
        </button>
      </li>
    ));
    if (!items || !items.length)
      return (
        <div>Games not found</div>
      )
    else
      return (
        <ul className="grid grid-cols-auto-200 gap-4 justify-center">
          {items}
        </ul>
      )
  }

  return (
    <article>
      <h1>Games</h1>
      <h2>New Game</h2>
      {quizSelect()}
      <h2>Enter Game</h2>
      {gameSelect()}
    </article>
  );
}
