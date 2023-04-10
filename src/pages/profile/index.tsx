import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import type { Quiz } from "@prisma/client";
import GameSettings from "@/modules/game/GameSettings";
import { getTranslations } from "@/common/getTranslations";
import { useTranslation } from "next-i18next";
import Loading from "../../common/components/Loading";
import Button from "../../common/components/Button";
import GetCommonLayout from "../../common/getCommonLayout";

export default function ProfilePage() {
  const { data: sessionData } = useSession();
  const { t } = useTranslation("common");
  const { push } = useRouter();
  const [selectedQuiz, selectQuiz] = useState<Quiz | null>(null);

  const query = trpc.quiz.getUserQuizzes.useQuery();

  const mutation = trpc.quiz.createQuiz.useMutation();

  function handleNewQuiz() {
    mutation.mutate(undefined, {
      onSuccess: (data) => {
        push(`profile/quizzes/${data.id}`).catch((err) => console.error(err));
        //   query.refetch();
      },
    });
  }

  if (query.isLoading) return <Loading />;
  return (
    <article className="h-full">
      {selectedQuiz && (
        <GameSettings
          quiz={selectedQuiz}
          cancelSelect={() => selectQuiz(null)}
          userId={sessionData?.user.id}
        />
      )}
      <h1>{t("Profile")}</h1>
      <ul className="grid grid-cols-auto-200 justify-center gap-4">
        {query.data?.map((quiz) => {
          return (
            <li
              key={quiz.id}
              onClick={() => selectQuiz(quiz)}
              className="flex flex-col justify-between bordered hover:bg-teal-200 cursor-pointer gap-2 p-4"
            >
              <span className="block">{quiz.name}</span>
              <span className="opacity-60">
                {quiz.tags.map((tag) => tag.name).join(", ")}
              </span>
              <span
                className={
                  quiz.isPublished
                    ? quiz.isPrivate
                      ? "text-rose-700"
                      : "text-teal-700"
                    : "text-gray-600"
                }
              >
                {quiz.isPublished
                  ? quiz.isPrivate
                    ? t("Private")
                    : t("Published")
                  : t("Unpublished")}
              </span>
            </li>
          );
        })}
        <li>
          <Button
            attr={{ className: "w-full h-full p-5" }}
            onClick={handleNewQuiz}
          >
            {t("Сreate New Quiz")}
          </Button>
        </li>
      </ul>
    </article>
  );
}

export const getServerSideProps = getTranslations;

ProfilePage.getLayout = GetCommonLayout;
