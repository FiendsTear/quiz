import { RouterInputs, trpc } from "../../../utils/trpc";
import React from "react";
import lodash from "lodash";
import { useForm } from "react-hook-form";
import AnswerEditor from "./AnswerEditor";
import type { QuestionDTO } from "@/server/quiz/dto/questionDTO";

import Loading from "../../../common/components/Loading";
import { useTranslation } from "next-i18next";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useQuizStore } from "../quizStore";
import { validQuestionSchema } from "../quizSchema";
import Button, { ButtonVariant } from "../../../common/components/Button";

export type QuestionInput = RouterInputs["quiz"]["addOrUpdateQuestion"];

export default function QuestionEditor(props: { questionID: number }) {
  const { t } = useTranslation("common");

  const mutation = trpc.quiz.addOrUpdateQuestion.useMutation();
  const getQuestionQuery = trpc.quiz.getQuestion.useQuery(props.questionID, {});
  const questionDeletion = trpc.quiz.deleteQuestion.useMutation();
  const createAnswerMutation = trpc.quiz.createAnswer.useMutation();
  const answerDeletion = trpc.quiz.deleteAnswer.useMutation();

  let issues = useQuizStore((state) => state.questionsErrors[props.questionID]);
  if (!issues) issues = {};
  const setQuestionError = useQuizStore((state) => state.setQuestionError);
  const questionSchema = validQuestionSchema.omit({ answers: true });

  // form state
  const { register } = useForm<QuestionInput>({
    values: getQuestionQuery.data,
  });

  if (!getQuestionQuery.data) return <Loading />;
  const data = getQuestionQuery.data;

  function handleQuestionChange(changedValue: Partial<QuestionDTO>) {
    mutation.mutate(
      { ...data, ...changedValue },
      {
        onSuccess: () => {
          //   refetchQuestion();
        },
      }
    );
  }

  function refetchQuestion() {
    getQuestionQuery
      .refetch()
      .then((res) => {
        if (res.data) {
          const parseRes = questionSchema.safeParse(res.data);
          if (!parseRes.success)
            setQuestionError(res.data.id, parseRes.error.issues);
          else {
            setQuestionError(res.data.id, []);
          }
        }
      })
      .catch((err) => console.error(err));
  }

  function createAnswer() {
    createAnswerMutation.mutate(
      { questionID: props.questionID, order: data.answers.length + 1 },
      {
        onSuccess: () => {
          refetchQuestion();
        },
      }
    );
  }

  function deleteQuestion() {
    questionDeletion.mutate(props.questionID);
  }

  function deleteAnswer(answerID: number) {
    answerDeletion.mutate(answerID, {
      onSuccess: () => {
        refetchQuestion();
      },
    });
  }

  return (
    <form className="bordered p-4">
      <div className="flex gap-4 items-start content-center mb-4">
        <div className="grow h-full flex flex-col">
          <label htmlFor="question-body">{t("Question text")}</label>
          <textarea
            id="question-body"
            className="grow text-lg"
            {...register("body", {
              onChange: lodash.debounce(
                (e: React.ChangeEvent<HTMLInputElement>) => {
                  handleQuestionChange({ body: e.target.value });
                },
                700
              ),
            })}
          ></textarea>
          <label htmlFor="answer-description">{t("Correct answer description")}</label>
          <textarea
            id="answer-description"
            className="block grow"
            {...register("answerDescription", {
              onChange: lodash.debounce(
                (e: React.ChangeEvent<HTMLInputElement>) => {
                  handleQuestionChange({
                    answerDescription: e.target.value,
                  });
                },
                700
              ),
            })}
          ></textarea>
          <span className="issue">{issues["body"]}</span>
        </div>
        <div className="flex w-32 flex-col self-stretch">
          <label htmlFor="answer-weight">{t("Answer weight")}</label>
          <input
            id="answer-weight"
            type="number"
            className="block grow text-center text-lg"
            {...register("answerWeight", {
              onChange: lodash.debounce(
                (e: React.ChangeEvent<HTMLInputElement>) => {
                  handleQuestionChange({
                    answerWeight: Number(e.target.value),
                  });
                },
                700
              ),
            })}
          ></input>
          <span className="issue invisible">{issues["body"] ? "i" : ""}</span>
        </div>
        <Button
          variant={ButtonVariant.WARNING}
          attr={{ className: "aspect-square", title: "Delete question" }}
          onClick={deleteQuestion}
        >
          <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
        </Button>
      </div>
      <section className="flex justify-between">
        <span>Answers</span>
        <div className="flex">
          <span>Correct?</span>
          <span className="invisible">del</span>
        </div>
      </section>
      <ul className="flex flex-col gap-2 mb-3 ">
        {data.answers.map((answer) => {
          return (
            <li key={answer.id} className="flex gap-x-5 gap-y-1 items-start">
              <AnswerEditor
                answerID={answer.id}
                className="grow"
              ></AnswerEditor>
              <Button
                onClick={() => deleteAnswer(answer.id)}
                attr={{
                  title: "Delete answer",
                }}
                variant={ButtonVariant.WARNING}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </Button>
            </li>
          );
        })}
        <span className="issue">{issues["answers"]}</span>
      </ul>
      <Button onClick={createAnswer}>{t("Add answer variant")}</Button>
    </form>
  );
}
