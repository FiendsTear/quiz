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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    mutation.mutate({ ...question, ...{ body: e.target.value } });
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
      <label htmlFor="question-body">Question text</label>
      <input
        id="question-body"
        type="text"
        className="mb-3"
        {...register("body", { onChange: debounce(handleChange, 500) })}
      ></input>
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
