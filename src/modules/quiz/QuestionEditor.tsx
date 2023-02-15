import { trpc } from "../../utils/trpc";
import type { Answer, Question } from "@prisma/client";
import { useState } from "react";
import React from "react";
import debounce from "lodash.debounce";
import { useFieldArray, useForm } from "react-hook-form";
import AnswerEditor from "./AnswerEditor";

type QuestionWithAnswers = Question & { answers: Answer[] };

export default function QuestionEditor(props: { question: Question }) {
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
    mutation.mutate({ ...question, ...{ answerWeight: Number(e.target.value) } });
  }

  const answerMutation = trpc.quiz.addOrUpdateAnswer.useMutation();
  function createAnswer() {
    answerMutation.mutate(
      { questionID: question.id },
      {
        onSuccess: () => {
          getQuestionQuery.refetch().catch((err) => console.error(err));
        },
      }
    );
  }

  if (getQuestionQuery.isLoading) return <div>Загрузка</div>;
  return (
    <form className='border border-solid border-emerald-500 rounded-lg p-4'>
      <div className="flex gap-4">
        <div className="w-3/4">
          <label className='w-full' htmlFor="question-body">Question text</label>
          <input
            id="question-body"
            type="text"
            className="mb-3"
            {...register("body", { onChange: debounce(handleBodyChange, 500) })}
          ></input>
        </div>
        <div className="w-1/4">
          <label className='w-full' htmlFor="answer-weight">Answer weight</label>
          <input
            id="answer-weight"
            type="number"
            className="mb-3"
            {...register("answerWeight", { onChange: debounce(handleWeightChange, 500) })}
          ></input>
        </div>
      </div>
      <fieldset className="flex flex-col gap-2 mb-3">
        {fields.map((field, index) => {
          return (
            <AnswerEditor key={field.fieldID} answer={field}></AnswerEditor>
          );
        })}
      </fieldset>
      <button type="button" onClick={createAnswer}>
        Add answer variant
      </button>
    </form>
  );
}
