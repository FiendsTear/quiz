import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import type { Quiz } from "@prisma/client";
import GameSettings from "@/modules/game/GameSettings";

export default function GamesPage() {
  const { data: sessionData } = useSession();
  const { push } = useRouter();
  enum GameTabs {
    Find = "FIND",
    Create = "Create",
  }
  const [currentTab, setTab] = useState<GameTabs>(GameTabs.Find);

  const [selectedQuiz, selectQuiz] = useState<Quiz | null>(null);

  const gamesQuery = trpc.game.getActiveGames.useQuery();
  const quizQuery = trpc.quiz.getPublishedQuizzes.useQuery();

  function handleGameEnter(gameID: number) {
    push(`/games/${gameID}/player`).catch((err) => console.error(err));
  }

  return (
    <article className="relative h-full">
      {selectedQuiz && (
        <GameSettings
          quiz={selectedQuiz}
          cancelSelect={() => selectQuiz(null)}
        />
      )}
      <section>
        <button onClick={() => setTab(GameTabs.Find)}>Find</button>
        <button onClick={() => setTab(GameTabs.Create)}>Create</button>
      </section>
      {currentTab === GameTabs.Create && (
        <section>
          <h2>New Game</h2>
          {!quizQuery.data ||
            (!quizQuery.data.length && <div>Quizzes not found</div>)}
          <ul className="grid grid-cols-auto-200 gap-4 justify-center">
            {quizQuery.data?.map((quiz) => (
              <li
                key={quiz.id}
                onClick={() => selectQuiz(quiz)}
                className="flex flex-col justify-between bordered hover:bg-emerald-200 cursor-pointer gap-2 p-4"
              >
                <span className='block mb-1'>{quiz.name}</span>
                <span
                  className={quiz.isPrivate ? 'text-fuchsia-700' : 'text-emerald-700'}>
                  {sessionData?.user.id === quiz.userId ? quiz.isPrivate ? 'Your private quiz' : 'Your public quiz' : 'Public quiz'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {currentTab === GameTabs.Find && (
        <section>
          <h2>Enter Game</h2>
          {!gamesQuery.data ||
            (!gamesQuery.data.length && <div>Games not found</div>)}
          <ul className="grid grid-cols-auto-200 gap-4 justify-center">
            {gamesQuery.data?.map((game) => (
              <li key={game.id}>
                <button onClick={() => handleGameEnter(game.id)}>
                  Enter Game {game.id}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
