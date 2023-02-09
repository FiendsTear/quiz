import { trpc } from "../../utils/trpc";
import { Answer, Question } from "@prisma/client";
import { useState } from "react";
import React from "react";
import debounce from "lodash.debounce";
import { useFieldArray, useForm } from "react-hook-form";

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
        onSuccess: (data) => {
          getQuestionQuery.refetch();
        },
      }
    );
  }

  function handleAnswerChange(changedValue: Partial<Answer>, answer: Answer) {
    answerMutation.mutate(
      { ...answer, ...changedValue },
      {
        onSuccess: (data) => {
          getQuestionQuery.refetch();
        },
      }
    );
  }

  if (getQuestionQuery.isLoading) return <div>Загрузка</div>;
  return (
    <form>
      <input
        type="text"
        className="mb-3"
        {...register("body", { onChange: debounce(handleChange, 500) })}
      ></input>
      <fieldset className="flex flex-col gap-2">
        {fields.map((field, index) => {
          return (
            <section key={field.fieldID}>
              <input
                {...register(`answers.${index}.body`, {
                  onChange: debounce((e) => {
                    handleAnswerChange({ body: e.target.value }, field);
                  }, 500),
                })}
              />
              <input
                type="checkbox"
                {...register(`answers.${index}.isCorrect`,
                {
                  onChange: debounce(
                    (e) =>
                      handleAnswerChange(
                        { isCorrect: e.target.checked },
                        field
                      ),
                    500
                  ),
                })}
              ></input>
            </section>
          );
        })}
      </fieldset>
      <button type="button" onClick={createAnswer}>
        Add answer variant
      </button>
    </form>
  );
}
