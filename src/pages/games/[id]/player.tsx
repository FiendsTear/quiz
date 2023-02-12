import { GameStatus, RouterOutputs, trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState } from "react";
import CurrentQuestion from "../../../components/game/CurrentQuestion";

export default function GamePlayerPage() {
  const { query, isReady } = useRouter();
  const [gameState, setGameState] = useState<
    RouterOutputs["game"]["getGameState"]
  >({} as RouterOutputs["game"]["getGameState"]);
  const gameID = Number(query.id?.toString());

  const getGameQuery = trpc.game.getGameState.useQuery(gameID, {
    enabled: isReady,
    staleTime: Infinity,
    onSuccess(data) {
      setGameState(data);
    },
  });

  trpc.game.subcribeToGame.useSubscription(gameID, {
    onData(message) {
      setGameState(message);
    },
  });

  if (!gameState) return <div>Загрузка</div>;
  if (gameState.currentCorrectAnswers?.length) {
    console.log(gameState.currentCorrectAnswers);
    return (
      <div>
        {gameState.currentCorrectAnswers.map((answer) => (
          <div>{answer.body}</div>
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

  return <section>Ожидаем старта</section>;
}
