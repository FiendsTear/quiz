import { trpc } from "@/utils/trpc";
import { Question, Answer } from "@prisma/client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useTimer } from "react-timer-hook";
import { useTranslation } from "next-i18next";

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
  const { seconds, restart, pause, isRunning } = useTimer({
    expiryTimestamp: new Date(),
    autoStart: false,
    onExpire: () => {
      sendAnswer(null);
    },
  });

  function sendAnswer(answerID: number | null) {
    if (!answerSent) {
      answerMutation.mutate({ gameID: Number(query.id), answerID });
      pause();
    }
  }

  useEffect(() => {
    if (questionData.timerValue && !isRunning) {
      console.log("start timer", questionData.timerValue, isRunning);
      const time = new Date();
      time.setSeconds(time.getSeconds() + questionData.timerValue);
      restart(time, true);
      setAnswerSent(false);
    }
  }, [questionData.timerValue, restart, isRunning]);

  if (answerSent && !props.isHost) return <div>{t("Waiting for others")}</div>;
  return (
    <div className="flex flex-col">
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
      <svg
        viewBox="0 0 100 100"
        className="max-h-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="stroke-amber-400"
          cx="50"
          cy="50"
          r="48"
          fill="none"
          pathLength="360"
          strokeDasharray="370"
          strokeWidth={3}
          transform="rotate(-90,50,50)"
        >
          <animate
            attributeName="stroke-dashoffset"
            dur={questionData.timerValue}
            values="0;-370"
          ></animate>
        </circle>
        <text
          x="50"
          y="50"
          alignmentBaseline="central"
          textAnchor="middle"
          className="fill-stone-600"
        >
          {seconds}
        </text>
      </svg>
    </div>
  );
}
