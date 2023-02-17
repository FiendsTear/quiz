import { trpc } from "../../utils/trpc";
import type { Answer, Question } from "@prisma/client";
import { useState } from "react";
import React from "react";
import debounce from "lodash.debounce";
import { useFieldArray, useForm } from "react-hook-form";
import AnswerEditor from "./AnswerEditor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type QuestionWithAnswers = Question & { answers: Answer[] };

export default function QuestionEditor(props: {
  question: Question;
  refetchQuiz: { (): void };
}) {
  // state
  const [question, setQuestion] = useState<QuestionWithAnswers>(
    Object.assign({}, props.question, { answers: [] })
  );

  // form state
  const { register, control } = useForm<QuestionWithAnswers>({
    values: question,
  });
  const { fields } = useFieldArray({
    name: "answers",
    control,
    keyName: "fieldID",
  });

  const mutation = trpc.quiz.addOrUpdateQuestion.useMutation();
  const getQuestionQuery = trpc.quiz.getQuestion.useQuery(question.id, {
    onSuccess: (data) => {
      setQuestion({ ...question, ...data });
    },
  });

  function handleBodyChange(e: React.ChangeEvent<HTMLInputElement>) {
    mutation.mutate({ ...question, ...{ body: e.target.value } });
  }

  function handleWeightChange(e: React.ChangeEvent<HTMLInputElement>) {
    mutation.mutate({
      ...question,
      ...{ answerWeight: Number(e.target.value) },
    });
  }

  function reFetchQuestion() {
    getQuestionQuery.refetch().catch((err) => console.error(err));
  }

  const answerMutation = trpc.quiz.addOrUpdateAnswer.useMutation();
  function createAnswer() {
    answerMutation.mutate(
      { questionID: question.id },
      {
        onSuccess: () => {
          reFetchQuestion();
        },
      }
    );
  }
  const questionDeletion = trpc.quiz.deleteQuestion.useMutation();

  function deleteQuestion() {
    questionDeletion.mutate(question.id, {
      onSuccess() {
        props.refetchQuiz();
      },
    });
  }

  if (getQuestionQuery.isLoading) return <div>Загрузка</div>;
  return (
    <form className="bordered p-4">
      <div className="flex gap-4 items-start">
        <div className="w-3/4">
          <label htmlFor="question-body">Question text</label>
          <input
            id="question-body"
            type="text"
            className="mb-3"
            {...register("body", { onChange: debounce(handleBodyChange, 500) })}
          ></input>
        </div>
        <div className="w-1/4">
          <label htmlFor="answer-weight">Answer weight</label>
          <input
            id="answer-weight"
            type="number"
            className="mb-3"
            {...register("answerWeight", {
              onChange: debounce(handleWeightChange, 500),
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
      <fieldset className="flex flex-col gap-2 mb-3">
        {fields.map((field, index) => {
          return (
            <AnswerEditor
              key={field.fieldID}
              answer={field}
              refetchQuestion={reFetchQuestion}
            ></AnswerEditor>
          );
        })}
      </fieldset>
      <button type="button" onClick={createAnswer}>
        Add answer variant
      </button>
    </form>
  );
}
