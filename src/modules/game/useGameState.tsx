import { trpc } from "@/utils/trpc";
import { useState } from "react";
import type { RouterOutputs } from "../../utils/trpc";

export default function useGameState(gameID: number) {
  const [gameState, setGameState] = useState<
    RouterOutputs["game"]["getGameState"]
  >({} as RouterOutputs["game"]["getGameState"]);

  trpc.game.subcribeToGame.useSubscription(gameID, {
    onData(message) {
      setGameState({ ...gameState, ...message });
    },
  });

  return gameState;
}
