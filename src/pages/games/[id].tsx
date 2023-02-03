import { getGame } from "@/server/game/gameService";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { GameStatus } from "@prisma/client";

export default function GamePage() {
  const { query, isReady } = useRouter();
  const gameID = Number(query.id?.toString());
  console.log(gameID);
  const getGameQuery = trpc.game.getGame.useQuery(gameID, { enabled: isReady });

  const onEnterSub = trpc.game.onEnter.useSubscription(gameID, {
    onData(input: any) {
      console.log(input);
    },
    onError(err) {
      console.log(err);
    },
  });

  const startMutation = trpc.game.start.useMutation();
  const onStartSub = trpc.game.onStart.useSubscription(gameID, {
    onData(data) {
      console.log(data);
    },
  });

  function startGame() {
    startMutation.mutate({ id: gameID, status: GameStatus.STARTED });
  }

  if (getGameQuery.isLoading) return <div>Загрузка</div>;

  if (getGameQuery.data?.status === GameStatus.STARTED)
    return (
      <div>
        {getGameQuery.data?.quiz.questions.map((question) => (
          <div key={question.id}>{question.body}</div>
        ))}
      </div>
    );

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
