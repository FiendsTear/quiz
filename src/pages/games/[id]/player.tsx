import { GameStatus, trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import CurrentQuestion from "../../../components/game/CurrentQuestion";

export default function GamePlayerPage() {
  const { query, isReady } = useRouter();
  const gameID = Number(query.id?.toString());

  const getGameQuery = trpc.game.getGameState.useQuery(gameID, {
    enabled: isReady,
  });

  trpc.game.subcribeToGame.useSubscription(gameID, {
    onData(data) {},
  });

  if (getGameQuery.isLoading) return <div>Загрузка</div>;

  if (getGameQuery.data?.status === GameStatus.Ongoing)
    return (
      <CurrentQuestion
        questionData={getGameQuery.data.currentQuestion}
      ></CurrentQuestion>
    );

  return <section>Ожидаем старта</section>;
}
