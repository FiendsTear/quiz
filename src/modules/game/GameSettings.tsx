import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import type { Quiz } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { ModalWindow } from "../../common/components/ModalWindow";

export default function GameSettings(props: {
  quiz: Quiz;
  cancelSelect: { (): void };
  userId?: string;
}) {
  const { quiz, cancelSelect, userId } = props;
  const { push } = useRouter();

  const { t } = useTranslation();
  const mutation = trpc.game.create.useMutation({
    onSuccess: async (data) => {
      await push(`/games/${data}/host`);
    },
  });

  function createGame() {
    mutation.mutate(quiz.id);
  }

  function editQuiz() {
    push(`profile/quizzes/${quiz.id}`).catch((err) => console.error(err));
  }

  return (
    <ModalWindow>
      <form className="w-1/2 h-1/2 grid gap-4 grid-rows-2 bg-stone-200 p-2">
        <div>
          <input id="private_game" type="checkbox" />
          <label htmlFor="private_game">{t("Private game")}</label>
        </div>
        <div className="flex w-100 gap-6 justify-between items-end">
          <button onClick={() => cancelSelect()}>{t("Cancel")}</button>
          {userId && userId === quiz.userId && (
            <button type="button" onClick={() => editQuiz()}>
              {t("Edit Quiz")}
            </button>
          )}
          {quiz.isPublished && (
            <button type="button" onClick={() => createGame()}>
              {t("Create game")}
            </button>
          )}
        </div>
      </form>
    </ModalWindow>
  );
}
