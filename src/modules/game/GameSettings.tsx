import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import type { Quiz } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { ModalWindow } from "../../common/components/ModalWindow";
import { SubmitHandler } from "react-hook-form";
import { SyntheticEvent, useState } from "react";
import Button from "../../common/components/Button";

export default function GameSettings(props: {
  quiz: Quiz;
  cancelSelect: { (): void };
  userId?: string;
}) {
  const { quiz, cancelSelect, userId } = props;
  const { push } = useRouter();

  const [formData, setFormData] = useState<{
    quizID: number;
    isPrivate?: boolean;
  }>({ quizID: quiz.id });

  const { t } = useTranslation();
  const mutation = trpc.game.create.useMutation({
    onSuccess: async (data) => {
      await push(`/games/${data}/host`);
    },
  });

  function createGame(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    e.preventDefault();
    mutation.mutate(formData);
  }

  function editQuiz() {
    push(`profile/quizzes/${quiz.id}`).catch((err) => console.error(err));
  }

  return (
    <ModalWindow exit={cancelSelect}>
      <article className="w-1/3 h-1/3 flex flex-col items-center bg-stone-200 p-3 rounded-xl">
        <h3>{t("Game settings")}</h3>
        <form
          className="grow w-full grid gap-4 grid-rows-2"
          //   onSubmit={createGame}
        >
          <div>
            <input
              id="private_game"
              type="checkbox"
              name="isPrivate"
              onChange={(e) =>
                setFormData({ quizID: quiz.id, isPrivate: e.target.checked })
              }
            />
            <label htmlFor="private_game">{t("Private game")}</label>
          </div>
          <div className="flex w-100 gap-6 justify-between items-end">
            <Button onClick={() => cancelSelect()}>{t("Cancel")}</Button>
            {userId && userId === quiz.userId && (
              <Button onClick={() => editQuiz()}>{t("Edit Quiz")}</Button>
            )}
            {quiz.isPublished && (
              <Button onClick={createGame}>{t("Create game")}</Button>
            )}
          </div>
        </form>
      </article>
    </ModalWindow>
  );
}
