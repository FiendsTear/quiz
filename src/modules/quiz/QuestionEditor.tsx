import { RouterInputs, trpc } from "../../utils/trpc";
import React from "react";
import debounce from "lodash.debounce";
import { useForm } from "react-hook-form";
import AnswerEditor from "./AnswerEditor";
import type { QuestionDTO } from "@/server/quiz/dto/questionDTO";

import Loading from "../../common/components/Loading";
import { useTranslation } from "next-i18next";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useQuizStore } from "./quizStore";
import { validQuestionSchema } from "./quizSchema";

export type QuestionInput = RouterInputs["quiz"]["addOrUpdateQuestion"];

export default function QuestionEditor(props: { questionID: number }) {
  const { t } = useTranslation("common");

  const mutation = trpc.quiz.addOrUpdateQuestion.useMutation();
  const getQuestionQuery = trpc.quiz.getQuestion.useQuery(props.questionID, {});
  const questionDeletion = trpc.quiz.deleteQuestion.useMutation();
  const answerMutation = trpc.quiz.addOrUpdateAnswer.useMutation();
  const answerDeletion = trpc.quiz.deleteAnswer.useMutation();

  const issues = useQuizStore(
    (state) => state.questionsErrors[props.questionID]
  );
  const setQuestionError = useQuizStore((state) => state.setQuestionError);
  const questionSchema = validQuestionSchema.omit({ answers: true });

  // form state
  const { register, getValues, setValue } = useForm<QuestionInput>({
    values: getQuestionQuery.data,
  });

  if (!getQuestionQuery.data) return <Loading />;
  const data = getQuestionQuery.data;

  function handleQuestionChange(changedValue: Partial<QuestionDTO>) {
    mutation.mutate(
      { ...data, ...changedValue },
      {
        onSuccess: () => {
          refetchQuestion();
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
    answerMutation.mutate(
      { questionID: props.questionID },
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
      <div className="flex gap-4 items-start">
        <div className="w-3/4">
          <label htmlFor="question-body">{t("Question text")}</label>
          <input
            id="question-body"
            type="text"
            {...register("body", {
              onChange: debounce((e: React.ChangeEvent<HTMLInputElement>) => {
                handleQuestionChange({ body: e.target.value });
              }, 700),
            })}
          ></input>
          <span className="issue">{issues ? issues["body"] : ""}</span>
        </div>
        <div className="w-1/4">
          <label htmlFor="answer-weight">{t("Answer weight")}</label>
          <input
            id="answer-weight"
            type="number"
            className="mb-3"
            {...register("answerWeight", {
              onChange: debounce((e: React.ChangeEvent<HTMLInputElement>) => {
                handleQuestionChange({ answerWeight: Number(e.target.value) });
              }, 700),
            })}
          ></input>
        </div>
        <button
          type="button"
          className="warning aspect-square"
          onClick={deleteQuestion}
        >
          <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
        </button>
      </div>
      <ul className="flex flex-col gap-2 mb-3">
        {data.answers.map((answer) => {
          return (
            <li
              key={answer.id}
              className="flex items-end gap-x-5 gap-y-1 flex-wrap"
            >
              <AnswerEditor
                answerID={answer.id}
                className="grow"
              ></AnswerEditor>
              <button
                type="button"
                className="warning"
                onClick={() => deleteAnswer(answer.id)}
                title="Delete answer"
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
              <div className="w-full h-px bg-stone-300"></div>
            </li>
          );
        })}
        <span className="issue">{issues ? issues["answers"] : ""}</span>
      </ul>
      <button type="button" onClick={createAnswer}>
        {t("Add answer variant")}
      </button>
    </form>
  );
}
