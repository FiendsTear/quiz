import { GameStatus, trpc } from "@/utils/trpc";
import CurrentQuestion from "../../../modules/game/CurrentQuestion";
import { useRouter } from "next/router";
import type { RouterOutputs } from "../../../utils/trpc";
import { useState, useEffect, useRef, ReactElement } from "react";
import { getTranslations } from "@/common/getTranslations";
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
        <div>
          {gameState.currentCorrectAnswers.map((answer) => (
            <div key={answer.id}>{answer.body}</div>
          ))}
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
    <section className="w-full h-full">
      <div>Players:</div>
      <ul className="grid grid-cols-auto-200 gap-4">
        {gameState.players?.map((player) => {
          return (
            <li
              key={player.id}
              className="flex flex-col text-center items-center bordered gap-2 p-4"
            >
              <Userpic src={player.image} size={64} />
              {player.name}
            </li>
          );
        })}
      </ul>
      <Button
        onClick={() => startMutation.mutate(gameID)}
        attr={{
          className:
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl",
        }}
      >
        Start game
      </Button>
      {gameState.status === GameStatus.Created && (
        <div className="absolute bottom-3 right-3 flex gap-5">
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
    </section>
  );
}

HostGamePage.getLayout = function getLayout(page: ReactElement) {
  return <GameLayout>{page}</GameLayout>;
};

export const getServerSideProps = getTranslations;
