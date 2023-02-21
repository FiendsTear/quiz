import { trpc } from "@/utils/trpc";
import { Question, Answer } from "@prisma/client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useTimer } from "react-timer-hook";
import { setTimeout } from "timers";

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
      console.log("expired");
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
      time.setSeconds(time.getSeconds() + 15);
      restart(time, true);
      setAnswerSent(false);
    }
  }, [questionData.timerValue, restart, isRunning]);

  if (answerSent && !props.isHost) return <div>Waiting for others</div>;
  return (
    <div>
      <div className="text-center">{questionData.body}</div>
      <div>{seconds}</div>
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
    </div>
  );
}
