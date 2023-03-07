import React, { useState } from "react";
import type { RouterInputs } from "../../../utils/trpc";
import { trpc } from "../../../utils/trpc";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import debounce from "lodash.debounce";
import QuestionEditor from "../../../modules/quiz/QuestionEditor";
import TagEditor from "@/modules/quiz/TagEditor";
import { getTranslations } from "@/common/getTranslations";
import { useTranslation } from "next-i18next";
import Loading from "../../../common/components/Loading";
import Message from "../../../common/components/Message";
import { useQueries } from "@tanstack/react-query";

type QuizInput = RouterInputs["quiz"]["addOrUpdateQuiz"];
export default function NewQuizPage() {
  const { query, isReady, push } = useRouter();
  const [message, setMessage] = useState<boolean>(false);
  const { register } = useForm<QuizInput>();

  const { t } = useTranslation("common");
  const quizID = query.id as string;

  const getQuizQuery = trpc.quiz.getQuiz.useQuery(quizID, {
    enabled: isReady,
  });

  const questionQueries = trpc.useQueries((t) => {
    if (getQuizQuery.data) {
      return getQuizQuery.data.questions.map((question) => {
        console.log(question.id);
        return t.quiz.getQuestion(question.id);
      });
    }
    return [];
  });

  const quizMutation = trpc.quiz.addOrUpdateQuiz.useMutation();
  const questionMutation = trpc.quiz.addOrUpdateQuestion.useMutation();

  if (!isReady || !getQuizQuery.data) return <Loading />;

  function handleQuizChange(changedValue: QuizInput) {
    quizMutation.mutate(
      { ...{ id: +quizID }, isPublished: false, ...changedValue },
      {
        onSuccess: () => {
          refetchQuiz();
        },
      }
    );
  }

  function handlePublish() {
    quizMutation.mutate(
      { id: +quizID, isPublished: true },
      {
        onSuccess: () => {
          setMessage(true);
        },
      }
    );
  }

  function toProfilePage() {
    setMessage(false);
    push(`/profile`).catch((err) => console.error(err));
  }

  function refetchQuiz() {
    getQuizQuery.refetch().catch((err) => console.error(err));
  }

  function handleNewQuestion(order: number) {
    questionMutation.mutate(
      { quizID: +quizID, order },
      {
        onSuccess: () => {
          refetchQuiz();
        },
      }
    );
  }

  const { data } = getQuizQuery;

  return (
    <article className="relative h-full">
      {message && (
        <Message
          messageString="Quiz published successfully"
          confirmSelect={() => toProfilePage()}
        />
      )}
      <h1>{t("Edit Quiz")}</h1>
      <label htmlFor="quiz-name">{t("Quiz name")}</label>
      <input
        id="quiz-name"
        type="text"
        defaultValue={data.name}
        className="mb-3"
        {...register("name", {
          onChange: debounce((e: React.ChangeEvent<HTMLInputElement>) => {
            handleQuizChange({ name: e.target.value });
          }, 700),
        })}
      ></input>
      <TagEditor
        tags={data.tags}
        quizID={+quizID}
        refetchQuiz={refetchQuiz}
      ></TagEditor>
      <ul className="flex flex-col gap-5">
        {data.questions.map((question) => {
          return (
            <QuestionEditor
              key={question.id}
              questionID={question.id}
            ></QuestionEditor>
          );
        })}
      </ul>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => handleNewQuestion(data.questions.length)}
        >
          {t("Add Question")}
        </button>
        <div className="flex items-center gap-2">
          <input
            id="quiz-isPrivate"
            type="checkbox"
            defaultChecked={data.isPrivate}
            {...register(`isPrivate`, {
              onChange: debounce(
                (e: React.ChangeEvent<HTMLInputElement>) =>
                  handleQuizChange({ isPrivate: e.target.checked }),
                500
              ),
            })}
          ></input>
          <label htmlFor="quiz-isPrivate">{t("Private quiz")}</label>
          <button
            disabled={data.isPublished}
            type="button"
            onClick={handlePublish}
          >
            {t("Publish quiz")}
          </button>
        </div>
      </div>
    </article>
  );
}

export const getServerSideProps = getTranslations;
