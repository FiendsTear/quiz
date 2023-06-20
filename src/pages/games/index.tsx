import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState } from "react";
import type { Quiz } from "@prisma/client";
import GameSettings from "@/modules/game/GameSettings";
import { getTranslations } from "@/common/getTranslations";
import { useTranslation } from "next-i18next";
import type { FilterQuizDTO } from "@/server/quiz/dto/filterQuizDTO";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import Button from "../../common/components/Button";
import GetCommonLayout from "../../common/getCommonLayout";
import GameFilter from '@/modules/game/GameFilter';

export default function GamesPage() {
  const { push } = useRouter();
  enum GameTabs {
    Find = "FIND",
    Create = "Create",
  }
  const [currentTab, setTab] = useState<GameTabs>(GameTabs.Find);

  const [selectedQuiz, selectQuiz] = useState<Quiz | null>(null);

  const [isFilterVisible, setFilterVisible] = useState<boolean>(false);

  const [quizFilter, setQuizFilter] = useState<FilterQuizDTO>({ tags: [], quizName: '' });

  const { t } = useTranslation("common");

  const gamesQuery = trpc.game.getActiveGames.useQuery();
  const quizQuery = trpc.quiz.getPublishedQuizzes.useQuery(quizFilter);

  function handleGameEnter(gameID: number, accessCode?: string) {
    let url = `/games/${gameID}/player`;
    if (accessCode) url = `/games/${gameID}/player?accessCode=${accessCode}`;
    push(`/games/${gameID}/player`).catch((err) => console.error(err));
  }

  return (
    <article className="h-full">
      {selectedQuiz && (
        <GameSettings
          quiz={selectedQuiz}
          cancelSelect={() => selectQuiz(null)}
        />
      )}
      <section className="flex justify-around w-full rounded-full overflow-hidden mb-3">
        <Button
          onClick={() => setTab(GameTabs.Find)}
          attr={{ className: "grow rounded-none" }}
        >
          {t("Find")}
        </Button>
        <Button
          onClick={() => setTab(GameTabs.Create)}
          attr={{ className: "grow rounded-none" }}
        >
          {t("Create")}
        </Button>
      </section>
      {currentTab === GameTabs.Create && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3>{t("Select quiz")}</h3>
            <Button onClick={() => setFilterVisible(!isFilterVisible)}>
              <FontAwesomeIcon icon={faFilter}></FontAwesomeIcon>
            </Button>
          </div>
          {isFilterVisible && (
            <GameFilter onSubmit={filter => setQuizFilter(filter)}></GameFilter>
          )}

          {!quizQuery.data ||
            (!quizQuery.data.length && <div>{t("Quizzes not found")}</div>)}
          <ul className="grid grid-cols-auto-200 gap-4 justify-center">
            {quizQuery.data?.map((quiz) => (
              <li
                key={quiz.id}
                onClick={() => selectQuiz(quiz)}
                className="flex flex-col justify-between bordered hover:bg-teal-200 cursor-pointer gap-2 p-4"
              >
                <span>{quiz.name}</span>
                <span className="opacity-60">
                  {quiz.tags.map((tag) => tag.name).join(", ")}
                </span>
                {(quiz.ratings_count > 0) ? (
                  <span className="text-sm italic">{t("Rating")}: {quiz.ratings_avg}/5 ({quiz.ratings_count})</span>
                ) : (
                  <span className="text-sm italic">{t("No ratings")}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {currentTab === GameTabs.Find && (
        <section className="w-full h-full flex flex-col">
          {!gamesQuery.data ||
            (!gamesQuery.data.length && (
              <div className="grow flex justify-center items-center">
                {t("Games not found")}
              </div>
            ))}
          <ul className="grid grid-cols-auto-200 gap-4 justify-center">
            {gamesQuery.data?.map((game) => (
              <li
                key={game.id}
                className="flex flex-col bordered p-2 gap-2"
                onClick={() => handleGameEnter(game.id)}
              >
                <span className="text-center">{game.quiz.name}</span>
                {/* <span className="text-center">{game.}</span> */}
                {/* <Button>
                  {t("Enter Game")} {game.id}
                </Button> */}
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

GamesPage.getLayout = GetCommonLayout;
