import { GameStatus, trpc } from "@/utils/trpc";
import CurrentQuestion from "../../../modules/game/CurrentQuestion";
import { useRouter } from "next/router";
import type { RouterOutputs } from "../../../utils/trpc";
import { useState, useEffect, useRef } from "react";
import { getTranslations } from "@/common/getTranslations";
import Userpic from "../../../common/components/Userpic";
import { useTranslation } from "next-i18next";
import QRCode from "qrcode";
import ErrorComponent from "../../../common/components/Errror";

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
          <button onClick={() => nextQuestionMutation.mutate(gameID)}>
            Next question
          </button>
        </article>
      );
    }
  }

  return (
    <section>
      <canvas ref={QRCanvas} />
      <button type="button" onClick={copyLink}>
        {t("Copy link")}
      </button>
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
      <button type="button" onClick={() => startMutation.mutate(gameID)}>
        Start game
      </button>
    </section>
  );
}

export const getServerSideProps = getTranslations;
