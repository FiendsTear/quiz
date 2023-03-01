import { trpc } from "../../utils/trpc";
import type { Answer } from "@prisma/client";
import { useState } from "react";
import React from "react";
import debounce from "lodash.debounce";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "next-i18next";

export default function AnswerEditor(props: {
  answer: Answer;
  refetchQuestion: { (): void };
  refetchQuiz: { (): void };
}) {
  // state
  const [answer, setAnswer] = useState<Answer>(props.answer);

  // form state
  const { register } = useForm<Answer>({
    values: answer,
  });

  const { t } = useTranslation();

  const answerMutation = trpc.quiz.addOrUpdateAnswer.useMutation();
  const answerDeletion = trpc.quiz.deleteAnswer.useMutation();

  function handleAnswerChange(changedValue: Partial<Answer>) {
    answerMutation.mutate(
      { ...answer, ...changedValue },
      {
        onSuccess: (data) => {
<<<<<<< HEAD
            setAnswer(data);
            props.refetchQuiz();
        }
    });
=======
          setAnswer(data);
        },
      }
    );
>>>>>>> origin
  }

  const bodyInputID = `answer-body-${answer.id}`;
  const isCorrectInputID = `answer-isCorrect-${answer.id}`;

  function deleteAnswer() {
    answerDeletion.mutate(answer.id, {
      onSuccess() {
        props.refetchQuestion();
        props.refetchQuiz();
      },
    });
  }

  return (
    <section>
      <label htmlFor={bodyInputID}>{t("Answer text")}</label>
      <textarea
        id={bodyInputID}
        {...register(`body`, {
          onChange: debounce((e: React.ChangeEvent<HTMLInputElement>) => {
            handleAnswerChange({ body: e.target.value });
          }, 500),
        })}
      />

      <section className="flex justify-between">
        <div>
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
          <label htmlFor={isCorrectInputID}>{t("Is this answer correct?")}</label>
        </div>

        <button
          type="button"
          className="warning"
          onClick={deleteAnswer}
          title="Delete answer"
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </section>
    </section>
  );
}
