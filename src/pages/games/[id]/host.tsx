import { GameStatus, trpc } from "@/utils/trpc";
import CurrentQuestion from "../../../modules/game/CurrentQuestion";
import withSubscription from "../../../modules/game/useGameState";

import { useRouter } from "next/router";
import useGameState from "../../../modules/game/useGameState";
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

  const startMutation = trpc.game.start.useMutation({
    onSuccess(data) {
      console.log("start mut");
      console.log(data);
    },
  });

  function startGame() {
    startMutation.mutate(gameID);
  }

  if (gameState.status === GameStatus.Ongoing)
    return (
      <CurrentQuestion
        questionData={gameState.currentQuestion}
      ></CurrentQuestion>
    );

  return (
    <section>
      <div>Players:</div>
      <ul>
        {gameState.players?.map((player) => {
          return <li key={player.id}>{player.name}</li>;
        })}
      </ul>
      <button type="button" onClick={startGame}>
        Start game
      </button>
    </section>
  );
}
