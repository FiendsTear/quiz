import { GameStatus, trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState } from "react";
import CurrentQuestion from "../../../components/game/CurrentQuestion";

export default function GameHostPage() {
  const { query, isReady } = useRouter();
  const gameID = Number(query.id?.toString());
  const [gameState, setGameState] = useState();
  const getGameQuery = trpc.game.getGameState.useQuery(gameID, {
    enabled: isReady,
  });

  const onEnterSub = trpc.game.subcribeToGame.useSubscription(gameID, {
    enabled: isReady,
    onData(input: any) {
      console.log(input);
    },
    onError(err) {
      console.log(err);
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

  if (getGameQuery.isLoading) return <div>Загрузка</div>;

  if (getGameQuery.data?.status === GameStatus.Ongoing)
    return (
      <CurrentQuestion
        questionData={getGameQuery.data.currentQuestion}
      ></CurrentQuestion>
    );

  return (
    <section>
      Game
      <br />
      {getGameQuery.data?.status}
      <br />
      <button type="button" onClick={startGame}>
        Start game
      </button>
    </section>
  );
}
