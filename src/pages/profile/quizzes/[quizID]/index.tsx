import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { debounce } from "lodash";
import TagEditor from "@/modules/quiz/TagEditor";
import { getTranslations } from "@/common/getTranslations";
import { useTranslation } from "next-i18next";

import { useQuizStore } from "@/modules/quiz/quizStore";
import { RouterInputs, RouterOutputs } from '@/utils/trpc';
import { trpc } from "@/utils/trpc";
import Loading from '@/common/components/Loading';
import { validAnswerSchema, validQuestionSchema, validQuizSchema } from '@/modules/quiz/quizSchema';
import Message from '@/common/components/Message';
import QuestionEditor from '@/modules/quiz/QuestionEditor';
import Button from '@/common/components/Button';
import { ButtonVariant } from '@/common/components/Button';
import GetCommonLayout from '@/common/getCommonLayout';

type AnswerData = RouterOutputs["quiz"]["getAnswer"];
type QuizInput = RouterInputs["quiz"]["addOrUpdateQuiz"];

export default function NewQuizPage() {
  const { query, isReady, push } = useRouter();
  const [message, setMessage] = useState<boolean>(false);
  const { register } = useForm<QuizInput>();

  const { t } = useTranslation("common");
  const quizID = query.quizID as string;

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
  const deleteQuizMutation = trpc.quiz.deleteQuiz.useMutation();

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
      const answers: AnswerData[] = [];
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
      const dataToParse = { ...questionData, ...{ answers } };
      const parseRes = validQuestionSchema.safeParse(dataToParse);
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

  function deleteQuiz() {
    deleteQuizMutation.mutate(+quizID, {
      onSuccess: () => {
        push(`/profile`).catch((err) => console.error(err));
      },
    });
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
      {/* <h1>{t("Edit Quiz")}</h1> */}
      <div className="flex">
        <label htmlFor="quiz-name" className="text-lg min-w-[7rem]">
          {t("Quiz name")}
        </label>
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
      </div>

      <span className="issue">{issues ? issues["name"] : ""}</span>
      <section className="flex justify-between">
        <div>
          <TagEditor
            tags={data.tags}
            quizID={+quizID}
            refetchQuiz={refetchQuiz}
          ></TagEditor>
          <span className="issue mb-5 block">
            {issues ? issues["tags"] : ""}
          </span>
        </div>
        <div>
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
        </div>
      </section>

      <section className="w-2/3 mx-auto">
        <span className="issue">{issues ? issues["questions"] : ""}</span>
        <ul className="flex flex-col gap-5 m-auto mb-5">
          {data.questions.map((question) => {
            return (
              <li key={question.id}>
                <QuestionEditor questionID={question.id}></QuestionEditor>
              </li>
            );
          })}
          <li>
            <Button
              attr={{ className: "w-full" }}
              onClick={() => handleNewQuestion(data.questions.length)}
            >
              {t("Add Question")}
            </Button>
          </li>
        </ul>
        <div className="flex items-center justify-between">
          <Button
            variant={ButtonVariant.WARNING}
            onClick={deleteQuiz}
            attr={{ className: "text-lg" }}
          >
            {t("Delete quiz")}
          </Button>
          <Button
            attr={{ disabled: data.isPublished, className: "text-lg" }}
            onClick={handlePublish}
          >
            {t("Publish quiz")}
          </Button>
        </div>
      </section>
    </article>
  );
}

export const getServerSideProps = getTranslations;
NewQuizPage.getLayout = GetCommonLayout;
