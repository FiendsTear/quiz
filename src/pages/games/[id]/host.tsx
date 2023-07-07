import { GameStatus, trpc } from "@/utils/trpc";
import CurrentQuestion from "../../../modules/game/CurrentQuestion";
import { useRouter } from "next/router";
import type { RouterOutputs } from "../../../utils/trpc";
import { useState, useEffect, useRef, ReactElement } from "react";
import { getTranslations } from "@/common/helpers/getTranslations";
import Userpic from "../../../common/components/Userpic";
import { useTranslation } from "next-i18next";
import QRCode from "qrcode";
import ErrorComponent from "../../../common/components/Errror";
import Button from "../../../common/components/Button";
import GameLayout from "../../../modules/game/GameLayout";

export default function HostGamePage() {
  const { query, isReady } = useRouter();
  const gameID = Number(query.id?.toString());
  const { t } = useTranslation("common");

  const [gameState, setGameState] = useState<
    RouterOutputs["game"]["getGameState"]
  >({} as RouterOutputs["game"]["getGameState"]);

  const QRCanvas = useRef<HTMLCanvasElement>(null);

  trpc.game.getGameState.useQuery(gameID, {
    // enabled if there's nothing in game state yet
    enabled: isReady && !gameState.status,
    onSuccess: (data) => {
      setGameState(data);
    },
  });

  useEffect(() => {
    if (gameState.status === GameStatus.Created)
      QRCode.toCanvas(QRCanvas.current, getURLForPlayer()).catch((err) =>
        console.error(err)
      );
  }, [isReady, gameState]);

  const startMutation = trpc.game.start.useMutation();
  const nextQuestionMutation = trpc.game.nextQuestion.useMutation();

  function getURLForPlayer() {
    let url = `${window.location.origin}/games/${gameID}/player`;
    if (gameState.accessCode) url = `${url}?accessCode=${gameState.accessCode}`;
    return url;
  }

  async function copyLink() {
    await navigator.clipboard.writeText(getURLForPlayer());
  }

  trpc.game.subcribeToGame.useSubscription(gameID, {
    onData(message) {
      setGameState({ ...gameState, ...message });
    },
    onError(err) {
      setErrored(err.message);
    },
  });

  const [errored, setErrored] = useState<string>("");
  if (errored) return <ErrorComponent message={errored}></ErrorComponent>;

  if (gameState.status === GameStatus.Ongoing) {
    if (gameState.currentCorrectAnswers?.length) {
      return (
        <div className="w-full h-full flex flex-col">
          {gameState.currentCorrectAnswers.length > 1 ?
            (<h3>{t("Correct answers")}</h3>) : (<h3>{t("Correct answer")}</h3>)
          }
          <ul className="flex flex-col grow self-stretch flex-wrap gap-4 min-h-0">
            {gameState.currentCorrectAnswers.map((answer) => (
              <li key={answer.id}
                className="flex flex-col text-center items-center bordered gap-2 p-4">{answer.body}</li>
            ))}
          </ul>
        </div>
      );
    } else {
      return (
        <article>
          <CurrentQuestion
            questionData={gameState.currentQuestion}
            isHost={true}
          ></CurrentQuestion>
          <Button onClick={() => nextQuestionMutation.mutate(gameID)}>
            Next question
          </Button>
        </article>
      );
    }
  }

  return (
    <section className="w-full h-full flex justify-between box-border">
      <div className="h-full flex flex-col">
        <h3>Players</h3>
        <ul className="flex flex-col grow self-stretch flex-wrap gap-4 min-h-0">
          {gameState.players?.map((player) => {
            return (
              <li
                key={player.id}
                className="flex flex-col text-center items-center bordered gap-2 p-4"
              >
                <Userpic src={player.image} size={64} />
                <span>{player.name}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col justify-end gap-5">
        <Button
          onClick={() => startMutation.mutate(gameID)}
          attr={{ className: "text-xl" }}
        >
          Start game
        </Button>
        {gameState.status === GameStatus.Created && (
          <div className="bottom-3 right-3 flex gap-5">
            <section className="flex flex-col gap-2">
              <h3>Invite</h3>
              <Button onClick={copyLink}>{t("Copy link")}</Button>
            </section>

            <section>
              <h3 className="text-center">Join game</h3>
              <canvas ref={QRCanvas} />
            </section>
          </div>
        )}
      </div>
    </section>
  );
}

HostGamePage.getLayout = function getLayout(page: ReactElement) {
  return <GameLayout>{page}</GameLayout>;
};

export const getServerSideProps = getTranslations;
