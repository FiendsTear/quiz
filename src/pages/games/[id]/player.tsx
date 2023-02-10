import { GameStatus, trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

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
      <></>
      //   <CurrentQuestion
      //     questionData={getGameQuery.data.quiz.questions[0]}
      //   ></CurrentQuestion>
    );

  return <section>Ожидаем старта</section>;
}
