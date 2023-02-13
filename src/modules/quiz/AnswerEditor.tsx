import { trpc } from "../../utils/trpc";
import type { Answer } from "@prisma/client";
import { useState } from "react";
import React from "react";
import debounce from "lodash.debounce";
import { useForm } from "react-hook-form";

export default function AnswerEditor(props: { answer: Answer }) {
  // state
  const [answer, setAnswer] = useState<Answer>(props.answer);

  // form state
  const { register } = useForm<Answer>({
    values: answer,
  });

  const answerMutation = trpc.quiz.addOrUpdateAnswer.useMutation();

  function handleAnswerChange(changedValue: Partial<Answer>) {
    answerMutation.mutate({ ...answer, ...changedValue });
  }

  const bodyInputID = `answer-body-${answer.id}`;
  const isCorrectInputID = `answer-isCorrect-${answer.id}`;

  return (
    <section>
      <label htmlFor={bodyInputID}>Answer text</label>
      <textarea
        id={bodyInputID}
        {...register(`body`, {
          onChange: debounce((e: React.ChangeEvent<HTMLInputElement>) => {
            handleAnswerChange({ body: e.target.value });
          }, 500),
        })}
      />
      <input
        id={isCorrectInputID}
        type="checkbox"
        {...register(`isCorrect`, {
          onChange: debounce(
            (e: React.ChangeEvent<HTMLInputElement>) =>
              handleAnswerChange({ isCorrect: e.target.checked }),
            500
          ),
        })}
      ></input>
      <label htmlFor={isCorrectInputID}>Is this answer correct?</label>
    </section>
  );
}
