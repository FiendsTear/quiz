import React, { useState } from "react";
import type { RouterInputs } from "../../../utils/trpc";
import { trpc } from "../../../utils/trpc";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import debounce from "lodash.debounce";
import QuestionEditor, {
  QuestionInput,
} from "../../../modules/quiz/QuestionEditor";
import TagEditor from "@/modules/quiz/TagEditor";
import { getTranslations } from "@/common/getTranslations";
import { useTranslation } from "next-i18next";
import Loading from "../../../common/components/Loading";
import Message from "../../../common/components/Message";
import { QuizSchema, validQuizSchema } from "../../../modules/quiz/quizSchema";
import {
  validQuestionSchema,
  validAnswerSchema,
} from "../../../modules/quiz/quizSchema";
import { useQuizStore } from "@/modules/quiz/quizStore";
import { Answer } from "@prisma/client";

type QuizInput = RouterInputs["quiz"]["addOrUpdateQuiz"];

export default function NewQuizPage() {
  const { query, isReady, push } = useRouter();
  const [message, setMessage] = useState<boolean>(false);
  const { register } = useForm<QuizInput>();

  const { t } = useTranslation("common");
  const quizID = query.id as string;

  const getQuizQuery = trpc.quiz.getQuiz.useQuery(quizID, {
    enabled: isReady,
    staleTime: 60,
  });

  const setAnswerError = useQuizStore((state) => state.setAnswerError);
  const setQuestionError = useQuizStore((state) => state.setQuestionError);
  const setQuizError = useQuizStore((state) => state.setQuizError);
  const issues = useQuizStore((state) => state.quizErrors);

  const ctx = trpc.useContext();
  //   const setError = useQuizStore(state => state.set);

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
    if (!getQuizQuery.data) return;
    const quizData = getQuizQuery.data;
    let quizValidForPublication = true;
    quizData.questions.map((question) => {
      const questionData = ctx.quiz.getQuestion.getData(question.id);
      if (!questionData) return;
      const answers: Answer[] | undefined = [];
      // validate and consolidate question answers
      questionData.answers.map((answer) => {
        const answerData = ctx.quiz.getAnswer.getData(answer.id);
        if (!answerData) return;
        answers.push(answerData);
        const answerParseRes = validAnswerSchema.safeParse(answerData);
        if (!answerParseRes.success) {
          quizValidForPublication = false;
          setAnswerError(answer.id, answerParseRes.error.issues);
        }
      });
      questionData.answers = answers;
      const parseRes = validQuestionSchema.safeParse(questionData);
      if (!parseRes.success) {
        quizValidForPublication = false;
        setQuestionError(question.id, parseRes.error.issues);
      }
    });

    const quizParseRes = validQuizSchema.safeParse(quizData);
    if (!quizParseRes.success) {
      setQuizError(quizParseRes.error.issues);
      quizValidForPublication = false;
    }
    if (quizValidForPublication) {
      quizMutation.mutate(
        { id: +quizID, isPublished: true },
        {
          onSuccess: () => {
            setMessage(true);
          },
        }
      );
    }
  }

  function toProfilePage() {
    setMessage(false);
    push(`/profile`).catch((err) => console.error(err));
  }

  function refetchQuiz() {
    getQuizQuery
      .refetch()
      .then((res) => {
        if (res.data) {
          const parseRes = validQuizSchema.safeParse(res.data);
          if (!parseRes.success) setQuizError(parseRes.error.issues);
          else {
            setQuizError([]);
          }
        }
      })
      .catch((err) => console.error(err));
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
      <span className="issue">{issues ? issues["tags"] : ""}</span>
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
