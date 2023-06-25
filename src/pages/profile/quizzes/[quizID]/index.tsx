import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import lodash from "lodash";
import TagEditor from "@/modules/quiz/components/TagEditor";
import { getTranslations } from "@/common/helpers/getTranslations";
import { useTranslation } from "next-i18next";

import { useQuizStore } from "@/modules/quiz/quizStore";
import { RouterInputs } from "@/utils/trpc";
import { trpc } from "@/utils/trpc";
import Loading from "@/common/components/Loading";
import { validQuizSchema } from "@/modules/quiz/quizSchema";
import Message from "@/common/components/Message";
import QuestionEditor from "@/modules/quiz/components/QuestionEditor";
import Button from "@/common/components/Button";
import { ButtonVariant } from "@/common/components/Button";
import GetCommonLayout from "@/common/getCommonLayout";
import { usePublisher } from "../../../../modules/quiz/hooks/usePublisher";

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

  const setQuizError = useQuizStore((state) => state.setQuizError);
  const issues = useQuizStore((state) => state.quizErrors);

  const { publish } = usePublisher(quizID);

  const quizMutation = trpc.quiz.addOrUpdateQuiz.useMutation();
  const questionMutation = trpc.quiz.addOrUpdateQuestion.useMutation();
  const deleteQuizMutation = trpc.quiz.deleteQuiz.useMutation();

  if (!isReady || !getQuizQuery.data) return <Loading />;

  function handleQuizChange(changedValue: QuizInput) {
    quizMutation.mutate(
      { ...{ id: +quizID }, isPublished: false, ...changedValue },
      {
        onSuccess: () => {
          //   refetchQuiz();
        },
      }
    );
  }

  async function handlePublish() {
    const publishResult = await publish();
    setMessage(publishResult);
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
      <header className="flex w-2/3 mx-auto">
        <div className="grow">
          <label htmlFor="quiz-name" className="text-lg min-w-[7rem]">
            {t("Quiz name")}
          </label>
          <input
            id="quiz-name"
            type="text"
            defaultValue={data.name}
            className="mb-3"
            {...register("name", {
              onChange: lodash.debounce(
                (e: React.ChangeEvent<HTMLInputElement>) => {
                  handleQuizChange({ name: e.target.value });
                },
                700
              ),
            })}
          ></input>
          <span className="issue">{issues ? issues["name"] : ""}</span>
        </div>
      </header>
      {/* <aside className="fixed top-10">
        <Button
          onClick={() => push(`/profile/quizzes/${quizID}`)}
          attr={{ className: "mr-2" }}
        >
          <FontAwesomeIcon
            icon={faBars}
            title="to basic view"
          ></FontAwesomeIcon>
        </Button>
        <Button onClick={() => push(`/profile/quizzes/${quizID}/advanced`)}>
          <FontAwesomeIcon
            icon={faLayerGroup}
            title="to advanced view"
          ></FontAwesomeIcon>
        </Button>
      </aside> */}
      <section className="flex justify-between w-2/3 mx-auto">
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
              onChange: lodash.debounce(
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
