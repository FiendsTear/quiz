import type { RouterInputs } from "../../utils/trpc";
import { trpc } from "../../utils/trpc";
import type { Answer } from "@prisma/client";
import React from "react";
import debounce from "lodash.debounce";
import { useForm } from "react-hook-form";
import { useTranslation } from "next-i18next";
import Loading from "../../common/components/Loading";

type AnswerInput = RouterInputs["quiz"]["addOrUpdateAnswer"];

export default function AnswerEditor(props: {
  answerID: number;
  className: string;
}) {
  const answerID = props.answerID;

  const { t } = useTranslation();

  // server state
  const answerQuery = trpc.quiz.getAnswer.useQuery(answerID);
  const answerMutation = trpc.quiz.addOrUpdateAnswer.useMutation();

  // form state
  const { register } = useForm<AnswerInput>({ values: answerQuery.data });

  if (!answerQuery.data) return <Loading />;
  const data = answerQuery.data;

  function handleAnswerChange(changedValue: Partial<Answer>) {
    answerMutation.mutate({ ...data, ...changedValue });
  }

  const bodyInputID = `answer-body-${answerID}`;
  const isCorrectInputID = `answer-isCorrect-${answerID}`;

  return (
    <section className={props.className}>
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
          <label htmlFor={isCorrectInputID}>
            {t("Is this answer correct?")}
          </label>
        </div>
      </section>
    </section>
  );
}
