import { GameStatus, trpc } from "@/utils/trpc";
import { useState, useEffect, ReactElement } from "react";
import CurrentQuestion from "../../../modules/game/CurrentQuestion";
import { useRouter } from "next/router";
import { RouterOutputs } from "../../../utils/trpc";
import { getTranslations } from "@/common/getTranslations";
import { useTranslation } from "next-i18next";
import Loading from "../../../common/components/Loading";
import ErrorComponent from "../../../common/components/Errror";
import isBrowser from "../../../common/helpers/isBrowser";
import GameLayout from "../../../modules/game/GameLayout";
import { boolean } from "zod";
import Message from "../../../common/components/Message";

export default function PlayerGamePage() {
  const { query, isReady, push } = useRouter();
  const gameID = Number(query.id?.toString());
  const accessCode = query.accessCode?.toString();
  //   const gameState = useGameState(gameID);
  const { t } = useTranslation("common");

  const [message, setMessage] = useState<boolean>();
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

  const [rateVisible, setRateVisible] = useState(true);
  const rateValues = [1,2,3,4,5];
  const rateMutation = trpc.quiz.rateQuiz.useMutation({
    onSuccess() {
      setRateVisible(false);
    }
  });

  const leaveMutation = trpc.game.leave.useMutation();
  useEffect(() => {
    if (isBrowser()) {
      window.onblur = () => {
        leaveMutation.mutate(0);
      };
    }
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

  useEffect(() => {
    if (gameState.status === GameStatus.Ongoing) {
      setMessage(true);
    }
  }, [gameState.status]);

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

  if (gameState.status === GameStatus.Ongoing) {
    return (
      <section>
        {message && (
          <Message
            messageString={t("Cheat warning")}
            confirmSelect={() => setMessage(false)}
          />
        )}
        <CurrentQuestion
          questionData={gameState.currentQuestion}
        ></CurrentQuestion>
      </section>
    );
  }

  if (gameState.status === GameStatus.Finished) {
    return (
      <section>
        <h3>{t("Results")}</h3>
        {gameState.players.map((player) => {
          return (
            <div key={player.id}>{`${player.name}   ${player.score}`}</div>
          );
        })}
        {rateVisible && (
          <>
            <h3>{t("Rate this quiz")}</h3>
            <div className="flex gap-2">
              {rateValues.map((value) => {
                return (
                  <span className="rating_number" key={value} onClick={() => rateMutation.mutate({ value, quizID: gameState.quizID })}>{value}</span>
                )
              })}
            </div>
          </>
        )}

      </section>
    );
  }

  return (
    <section className="w-full h-full flex justify-center items-center">
      Waiting for start
    </section>
  );
}

export const getServerSideProps = getTranslations;
PlayerGamePage.getLayout = function getLayout(page: ReactElement) {
  return <GameLayout>{page}</GameLayout>;
};
