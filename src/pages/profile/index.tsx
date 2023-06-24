import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc, RouterOutputs } from "../../utils/trpc";
import type { Quiz } from "@prisma/client";
import GameSettings from "@/modules/game/GameSettings";
import { getTranslations } from "@/common/helpers/getTranslations";
import { useTranslation } from "next-i18next";
import Loading from "../../common/components/Loading";
import Button from "../../common/components/Button";
import GetCommonLayout from "../../common/getCommonLayout";
import QuizCard from "../../modules/quiz/components/QuizCard";

export default function ProfilePage() {
  const { data: sessionData } = useSession();
  const { t } = useTranslation("common");
  const [selectedQuiz, selectQuiz] = useState<Quiz | null>(null);

  const { push } = useRouter();

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

  function handleClick(quiz: Quiz) {
    if (quiz.isPublished) {
      selectQuiz(quiz);
      return null;
    }
    push(`profile/quizzes/${quiz.id}`).catch((err) => console.error(err));
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
      {/* <h1>{t("My quizzes")}</h1> */}
      <ul className="grid grid-cols-auto-200 justify-center gap-4">
        {query.data?.map((quiz) => {
          return (
            <li key={quiz.id} onClick={() => handleClick(quiz)}>
              <QuizCard quiz={quiz}></QuizCard>
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
