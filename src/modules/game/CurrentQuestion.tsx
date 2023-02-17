import { trpc } from "@/utils/trpc";
import { Question, Answer } from "@prisma/client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
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
  const [questionTimer, setTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const answerMutation = trpc.game.answer.useMutation({
    onSuccess: () => {
      setAnswerSent(true);
    },
  });

  function sendAnswer(answerID: number | null) {
    if (!answerSent) {
      answerMutation.mutate({ gameID: Number(query.id), answerID });
      if (questionTimer) clearTimeout(questionTimer);
      setTimer(null);
    }
  }
  useEffect(() => {
    if (questionData.timerValue && !questionTimer) {
      const timer: ReturnType<typeof setTimeout> = setTimeout(
        () => sendAnswer(null),
        questionData.timerValue
      );
      setTimer(timer);
      setAnswerSent(false);
    }
  });

  if (answerSent && !props.isHost) return <div>Waiting for others</div>;
  return (
    <div>
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
    </div>
  );
}
