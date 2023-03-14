import type { RouterInputs } from "../../utils/trpc";
import { trpc } from "../../utils/trpc";
import type { Answer } from "@prisma/client";
import React from "react";
import debounce from "lodash.debounce";
import { useForm } from "react-hook-form";
import { useTranslation } from "next-i18next";
import Loading from "../../common/components/Loading";
import { useQuizStore } from "./quizStore";
import { validAnswerSchema, validAnswerParameters } from "./quizSchema";

export type AnswerInput = RouterInputs["quiz"]["addOrUpdateAnswer"];

export default function AnswerEditor(props: {
  answerID: number;
  className: string;
}) {
  const answerID = props.answerID;

  const { t } = useTranslation();

  // server state
  const answerQuery = trpc.quiz.getAnswer.useQuery(answerID);
  const answerMutation = trpc.quiz.addOrUpdateAnswer.useMutation();

  const setAnswerError = useQuizStore((state) => state.setAnswerError);
  const issues = useQuizStore((state) => state.answersErrors[answerID]);

  // form state
  const { register } = useForm<AnswerInput>({ values: answerQuery.data });

  if (!answerQuery.data) return <Loading />;
  const data = answerQuery.data;

  function handleAnswerChange(changedValue: Partial<Answer>) {
    answerMutation.mutate(
      { ...data, ...changedValue },
      {
        onSuccess: () => {
          refetchAnswer();
        },
      }
    );
  }

  function refetchAnswer() {
    answerQuery
      .refetch()
      .then((res) => {
        if (res.data) {
          const parseRes = validAnswerSchema.safeParse(res.data);
          if (!parseRes.success)
            setAnswerError(answerID, parseRes.error.issues);
          else {
            setAnswerError(answerID, []);
          }
        }
      })
      .catch((err) => console.error(err));
  }

  const bodyInputID = `answer-body-${answerID}`;
  const isCorrectInputID = `answer-isCorrect-${answerID}`;

  return (
    <section className={props.className}>
      <label htmlFor={bodyInputID}>{t("Answer text")}</label>
      <textarea
        id={bodyInputID}
        maxLength={validAnswerParameters.body.maxLength}
        {...register(`body`, {
          onChange: debounce((e: React.ChangeEvent<HTMLInputElement>) => {
            handleAnswerChange({ body: e.target.value });
          }, 500),
        })}
      />
      <span className="issue">{issues ? issues["body"] : ""}</span>
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
