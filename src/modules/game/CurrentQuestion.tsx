import { trpc } from "@/utils/trpc";
import type { Question, Answer } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import Timer from "./Timer";

type QuestionData = Question & {
  answers: Answer[];
  timerValue: number;
};

export default function CurrentQuestion(props: {
  questionData: QuestionData;
  isHost?: boolean;
}) {
  const { questionData } = props;
  const { query } = useRouter();
  const [answerSent, setAnswerSent] = useState<boolean>(false);
  const { t } = useTranslation();
  //   const [questionTimer, setTimer] = useState<ReturnType<
  //     typeof setTimeout
  //   > | null>(null);

  const answerMutation = trpc.game.answer.useMutation({
    onSuccess: () => {
      setAnswerSent(true);
    },
  });

  function sendAnswer(answerID: number | null) {
    if (!answerSent) {
      answerMutation.mutate({ gameID: Number(query.id), answerID });
    }
  }

  if (answerSent && !props.isHost) return <div>{t("Waiting for others")}</div>;
  return (
    <div className="flex flex-col">
      <div>{questionData.hasMultipleCorrectAnswers}</div>
      <div className="text-center">{questionData.body}</div>
      <ul className="grid grid-cols-1 gap-3 justify-center">
        {questionData.answers.map((answer) => (
          <li
            className=""
            key={answer.id}
            onClick={() => sendAnswer(answer.id)}
          >
            <button
              type="button"
              className="w-full bg-amber-100 hover:bg-amber-200"
            >
              {answer.body}
            </button>
          </li>
        ))}
      </ul>
      <Timer
        secondsToExpire={questionData.timerValue}
        onExpire={() => sendAnswer(null)}
      />
    </div>
  );
}
