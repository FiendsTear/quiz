import { GameStatus, trpc } from "@/utils/trpc";
import CurrentQuestion from "../../../modules/game/CurrentQuestion";
import Userpic from "@/modules/Userpic";
import { useRouter } from "next/router";
import { RouterOutputs } from "../../../utils/trpc";
import { useState } from "react";
import { getTranslations } from "@/common/getTranslations";

export default function HostGamePage() {
  const { query, isReady } = useRouter();
  const gameID = Number(query.id?.toString());
  //   const gameState = useGameState(gameID);

  const [gameState, setGameState] = useState<
    RouterOutputs["game"]["getGameState"]
  >({} as RouterOutputs["game"]["getGameState"]);

  trpc.game.subcribeToGame.useSubscription(gameID, {
    onData(message) {
      setGameState({ ...gameState, ...message });
    },
  });

  const startMutation = trpc.game.start.useMutation();
  const nextQuestionMutation = trpc.game.nextQuestion.useMutation();

  if (gameState.status === GameStatus.Ongoing) {
    if (gameState.currentCorrectAnswers?.length) {
      return (
        <div>
          {gameState.currentCorrectAnswers.map((answer) => (
            <div key={answer.id}>{answer.body}</div>
          ))}
        </div>
      );
    } else {
      return (
        <article>
          <CurrentQuestion
            questionData={gameState.currentQuestion}
            isHost={true}
          ></CurrentQuestion>
          <button onClick={() => nextQuestionMutation.mutate(gameID)}>
            Next question
          </button>
        </article>
      );
    }
  }

  return (
    <section>
      <div>Players:</div>
      <ul className="grid grid-cols-auto-200 gap-4">
        {gameState.players?.map((player) => {
          return (
            <li
              key={player.id}
              className="flex flex-col text-center items-center bordered gap-2 p-4"
            >
              <Userpic src={player.image} size={64} />
              {player.name}
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={() => startMutation.mutate(gameID)}>
        Start game
      </button>
    </section>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
    return getTranslations({ locale });
  }
  