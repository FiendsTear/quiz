import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import type { Quiz, Tag } from "@prisma/client";
import GameSettings from "@/modules/game/GameSettings";
import { getTranslations } from "@/common/getTranslations";
import { useTranslation } from "next-i18next";
import type { FilterQuizDTO } from "@/server/quiz/dto/filterQuizDTO";
import { useForm } from "react-hook-form";
import Dropdown from "@/common/components/Dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faXmark } from "@fortawesome/free-solid-svg-icons";
import { debounce } from "lodash";


export default function GamesPage() {
  const { push } = useRouter();
  enum GameTabs {
    Find = "FIND",
    Create = "Create",
  }
  const [currentTab, setTab] = useState<GameTabs>(GameTabs.Find);

  const [selectedQuiz, selectQuiz] = useState<Quiz | null>(null);

  const [isFilterVisible, setFilterVisible] = useState<boolean>(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagName, setTagName] = useState<string>("");
  const [quizName, setQuizName] = useState<string>("");

  const filter: FilterQuizDTO = { tags, quizName };

  const { register } = useForm<FilterQuizDTO & { tagName: string }>({
    values: { ...filter, tagName },
  });

  const { t } = useTranslation("common");

  const gamesQuery = trpc.game.getActiveGames.useQuery();
  const quizQuery = trpc.quiz.getPublishedQuizzes.useQuery(filter);

  const tagsQuery = trpc.quiz.getTags.useQuery(tagName);

  function filterAddTag(newTag: Tag) {
    let isTagRepeated = false;
    tags.forEach((tag) => {
      if (tag.id === newTag.id) isTagRepeated = true;
    });
    if (!isTagRepeated) {
      setTags([...tags, newTag]);
      setTagName("");
    }
  }

  function filterRemoveTag(removeTag: Tag) {
    setTags(tags.filter((tag) => tag.id !== removeTag.id));
  }

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
      <section>
        <button onClick={() => setTab(GameTabs.Find)}>{t("Find")}</button>
        <button onClick={() => setTab(GameTabs.Create)}>{t("Create")}</button>
      </section>
      {currentTab === GameTabs.Create && (
        <section>
          <div className="flex items-center gap-2">
            <h2>{t("New game")}</h2>
            <button
              type="button"
              className=""
              onClick={() => setFilterVisible(!isFilterVisible)}
            >
              <FontAwesomeIcon icon={faFilter}></FontAwesomeIcon>
            </button>
          </div>
          {isFilterVisible && (
            <div className="mb-6">
              <h3 className="m-0 mb-3">{t("Filter")}:</h3>
              <label htmlFor="filter-tags">{t("Tags")}:</label>
              <ul className="flex items-center gap-2 m-0 mb-3">
                {tags.map((tag) => {
                  return (
                    <li
                      className="flex-none	bg-emerald-300 rounded-md pl-1"
                      key={tag.id}
                    >
                      {tag.name}
                      <button
                        type="button"
                        className="ml-1"
                        onClick={() => filterRemoveTag(tag)}
                      >
                        <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                      </button>
                    </li>
                  );
                })}
                <li className="grow min-w-max	flex items-center gap-1">
                  <Dropdown
                    id="filter-tags"
                    className="w-all lowercase"
                    options={tagName.length ? tagsQuery.data : []}
                    handleClick={filterAddTag}
                    {...register("tagName", {
                      onChange: debounce(
                        (e: React.ChangeEvent<HTMLInputElement>) =>
                          setTagName(e.target.value),
                        700
                      ),
                    })}
                  ></Dropdown>
                </li>
              </ul>
              <label htmlFor="filter-quiz">{t("Quiz name")}:</label>
              <input
                id="filter-quiz"
                type="text"
                {...register("quizName", {
                  onChange: debounce(
                    (e: React.ChangeEvent<HTMLInputElement>) =>
                      setQuizName(e.target.value),
                    700
                  ),
                })}
              />
            </div>
          )}

          {!quizQuery.data ||
            (!quizQuery.data.length && <div>{t("Quizzes not found")}</div>)}
          <ul className="grid grid-cols-auto-200 gap-4 justify-center">
            {quizQuery.data?.map((quiz) => (
              <li
                key={quiz.id}
                onClick={() => selectQuiz(quiz)}
                className="flex flex-col justify-between bordered hover:bg-emerald-200 cursor-pointer gap-2 p-4"
              >
                <span>{quiz.name}</span>
                <span className="opacity-60">
                  {quiz.tags.map((tag) => tag.name).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {currentTab === GameTabs.Find && (
        <section>
          <h2>{t("Enter Game")}</h2>
          {/* <div>
            <label htmlFor="room_code">{t("Room code")}</label>
            <input
              id="room_code"
              type="text"
              onChange={(e) => setAccessCode(e.target.value)}
            />
            <canvas id="qr_code"></canvas>
            <button type="button" onClick={handleGameEnter()}>
              {t("Enter")}
            </button>
          </div> */}
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
