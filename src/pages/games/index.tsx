import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState } from "react";
import type { Quiz } from "@prisma/client";
import GameSettings from "@/modules/game/GameSettings";
import { getTranslations } from "@/common/getTranslations";
import { useTranslation } from "next-i18next";

export default function GamesPage() {
  const { push } = useRouter();
  enum GameTabs {
    Find = "FIND",
    Create = "Create",
  }
  const [currentTab, setTab] = useState<GameTabs>(GameTabs.Find);

  const [selectedQuiz, selectQuiz] = useState<Quiz | null>(null);

  const { t } = useTranslation("common");

  const gamesQuery = trpc.game.getActiveGames.useQuery();
  const quizQuery = trpc.quiz.getPublishedQuizzes.useQuery();

  function handleGameEnter(gameID: number) {
    push(`/games/${gameID}/player`).catch((err) => console.error(err));
  }

  return (
    <article className="relative h-full">
      {selectedQuiz && (
        <GameSettings
          quiz={selectedQuiz}
          cancelSelect={() => selectQuiz(null)}
        />
      )}
      <section>
        <button onClick={() => setTab(GameTabs.Find)}>{t("Find")}</button>
        <button onClick={() => setTab(GameTabs.Create)}>{t("Create")}</button>
      </section>
      {currentTab === GameTabs.Create && (
        <section>
          <h2>{t("New game")}</h2>
          {!quizQuery.data ||
            (!quizQuery.data.length && <div>{t("Quizzes not found")}</div>)}
          <ul className="grid grid-cols-auto-200 gap-4 justify-center">
            {quizQuery.data?.map((quiz) => (
              <li
                key={quiz.id}
                onClick={() => selectQuiz(quiz)}
                className="flex flex-col justify-between bordered hover:bg-emerald-200 cursor-pointer gap-2 p-4"
              >
                {quiz.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      {currentTab === GameTabs.Find && (
        <section>
          <h2>{t("Enter Game")}</h2>
          {!gamesQuery.data ||
            (!gamesQuery.data.length && <div>{t("Games not found")}</div>)}
          <ul className="grid grid-cols-auto-200 gap-4 justify-center">
            {gamesQuery.data?.map((game) => (
              <li key={game.id}>
                <button onClick={() => handleGameEnter(game.id)}>
                  {t("Enter Game")} {game.id}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return getTranslations({ locale });
}
