import { GameStatus, trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";
import CurrentQuestion from "../../../modules/game/CurrentQuestion";
import { useRouter } from "next/router";
import { RouterOutputs } from "../../../utils/trpc";
import { getTranslations } from "@/common/getTranslations";
import { useTranslation } from "next-i18next";
import Loading from "../../../common/components/Loading";
import ErrorComponent from "../../../common/components/Errror";

export default function PlayerGamePage() {
  const { query, isReady, push } = useRouter();
  const gameID = Number(query.id?.toString());
  const accessCode = query.accessCode?.toString();
  //   const gameState = useGameState(gameID);
  const { t } = useTranslation("common");

  const [gameState, setGameState] = useState<
    RouterOutputs["game"]["getGameState"]
  >({} as RouterOutputs["game"]["getGameState"]);

  trpc.game.subcribeToGame.useSubscription(gameID, {
    onData(message) {
      setGameState({ ...gameState, ...message });
    },
    onError(err) {
      setErrored(err.message);
    },
  });

  const [connected, setConnected] = useState(false);
  const enterMutation = trpc.game.enter.useMutation({
    onSuccess(data) {
      setGameState({ ...gameState, ...data });
      setConnected(true);
    },
    onError: async (err) => {
      await push("/games");
    },
  });

  useEffect(() => {
    if (!connected) enterMutation.mutate({ gameID, accessCode });
  }, [isReady]);

  const [errored, setErrored] = useState<string>("");
  if (errored) return <ErrorComponent message={errored}></ErrorComponent>;

  if (!gameState) return <Loading />;
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

export const getServerSideProps = getTranslations;
