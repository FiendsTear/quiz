import { GameStatus, trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";
import CurrentQuestion from "../../../modules/game/CurrentQuestion";
import { useRouter } from "next/router";
import { RouterOutputs } from "../../../utils/trpc";

export default function PlayerGamePage() {
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

  const [connected, setConnected] = useState(false);
  const enterMutation = trpc.game.enter.useMutation({
    onSuccess(data) {
      setGameState({ ...gameState, ...data });
      setConnected(true);
    },
  });
  useEffect(() => {
    if (!connected) enterMutation.mutate(gameID);
  });

  if (!gameState) return <div>Загрузка</div>;
  if (gameState.currentCorrectAnswers?.length) {
    return (
      <div>
        {gameState.currentCorrectAnswers.map((answer) => (
          <div key={answer.id}>{answer.body}</div>
        ))}
      </div>
    );
  }

  if (gameState.status === GameStatus.Ongoing)
    return (
      <CurrentQuestion
        questionData={gameState.currentQuestion}
      ></CurrentQuestion>
    );

  if (gameState.status === GameStatus.Finished) {
    return (
      <section>
        {gameState.players.map((player) => {
          return (
            <div key={player.id}>{`${player.name}   ${player.score}`}</div>
          );
        })}
      </section>
    );
  }

  return <section>Waiting for start</section>;
}
