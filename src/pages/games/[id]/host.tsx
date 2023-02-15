import { GameStatus, trpc } from "@/utils/trpc";
import CurrentQuestion from "../../../modules/game/CurrentQuestion";

import { useRouter } from "next/router";
import { RouterOutputs } from "../../../utils/trpc";
import { useState } from "react";

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

  if (gameState.status === GameStatus.Ongoing)
    return (
      <article>
        <CurrentQuestion
          questionData={gameState.currentQuestion}
        ></CurrentQuestion>
        <button onClick={() => nextQuestionMutation.mutate(gameID)}>
          Next question
        </button>
      </article>
    );

  return (
    <section>
      <div>Players:</div>
      <ul>
        {gameState.players?.map((player) => {
          return <li key={player.id}>{player.name}</li>;
        })}
      </ul>
      <button type="button" onClick={() => startMutation.mutate(gameID)}>
        Start game
      </button>
    </section>
  );
}
