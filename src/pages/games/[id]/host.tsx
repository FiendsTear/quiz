import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { GameStatus } from "@prisma/client";
import { useState } from "react";

export default function GameHostPage() {
  const { query, isReady } = useRouter();
  const gameID = Number(query.id?.toString());

  const [ gameState, setGameState ] = useState();
  const getGameQuery = trpc.game.getGame.useQuery(gameID, { enabled: isReady });

  const onEnterSub = trpc.game.onEnter.useSubscription(gameID, {
    onData(input: any) {
      console.log(input);
    },
    onError(err) {
      console.log(err);
    },
  });

  const startMutation = trpc.game.start.useMutation({
    onSuccess(data) {
      console.log('start mut');
      console.log(data);
    }
  });
  trpc.game.onStart.useSubscription(gameID, {
    onData(data) {
      
    },
  });

  function startGame() {
    startMutation.mutate({ id: gameID, status: GameStatus.STARTED });
  }

  if (getGameQuery.isLoading) return <div>Загрузка</div>;

//   if (getGameQuery.data?.status === GameStatus.STARTED)
//     return <CurrentQuestion questionData={getGameQuery.data}></CurrentQuestion>;

  return (
    <section>
      Game
      <br />
      {getGameQuery.data?.quiz.name}
      <br />
      <button type="button" onClick={startGame}>
        Start game
      </button>
    </section>
  );
}
