import { getGame } from "@/server/game/gameService";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { GameStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
import CurrentQuestion from "../../../components/game/CurrentQuestion";

export default function GamePlayerPage() {
  const { query, isReady } = useRouter();
  const gameID = Number(query.id?.toString());

  const getGameQuery = trpc.game.getGame.useQuery(gameID, { enabled: isReady });

  trpc.game.onStart.useSubscription(gameID, {
    onData(data) {},
  });

  if (getGameQuery.isLoading) return <div>Загрузка</div>;

  if (getGameQuery.data?.status === GameStatus.STARTED)
    return (<></>
    //   <CurrentQuestion
    //     questionData={getGameQuery.data.quiz.questions[0]}
    //   ></CurrentQuestion>
    );

  return <section>Ожидаем старта</section>;
}
