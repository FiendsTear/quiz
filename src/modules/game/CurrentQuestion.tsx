import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import Timer from "./Timer";
import { RouterOutputs } from "../../utils/trpc";
import Button, { ButtonVariant } from "../../common/components/Button";

type QuestionData = RouterOutputs["game"]["getGameState"]["currentQuestion"];

export default function CurrentQuestion(props: {
  questionData: QuestionData;
  isHost?: boolean;
}) {
  const { questionData } = props;
  const { query } = useRouter();
  const [answerSent, setAnswerSent] = useState<boolean>(false);
  const [selectedAnswersID, setSelectedAnswers] = useState<number[]>([]);
  const { t } = useTranslation();
  //   const [questionTimer, setTimer] = useState<ReturnType<
  //     typeof setTimeout
  //   > | null>(null);

  const answerMutation = trpc.game.answer.useMutation({
    onSuccess: () => {
      setAnswerSent(true);
    },
  });

  function selectAnswer(answerID: number) {
    const answerIndex = selectedAnswersID.findIndex(
      (selectedAnswerID) => selectedAnswerID === answerID
    );
    if (answerIndex === -1) {
      setSelectedAnswers([...selectedAnswersID, answerID]);
      return;
    }
    const copy = [...selectedAnswersID];
    copy.splice(answerIndex, 1);
    setSelectedAnswers(copy);
  }

  function sendAnswers() {
    if (!answerSent) {
      answerMutation.mutate({
        gameID: Number(query.id),
        answersID: selectedAnswersID,
      });
    }
  }

  if (answerSent && !props.isHost) return <div>{t("Waiting for others")}</div>;
  return (
    <div className="flex flex-col">
      <div>{questionData.hasMultipleCorrectAnswers}</div>
      <div className="text-center">{questionData.body}</div>
      <ul className="grid grid-cols-1 gap-3 justify-center">
        {questionData.answers.map((answer) => (
          <li key={answer.id}>
            <Button
              variant={ButtonVariant.SELECTION}
              selected={selectedAnswersID.includes(answer.id)}
              onClick={() => selectAnswer(answer.id)}
              attr={{ className: "w-full" }}
            >
              {answer.body}
            </Button>
          </li>
        ))}
      </ul>
      {/* <Timer
        secondsToExpire={questionData.timerValue}
        onExpire={() => sendAnswers()}
      /> */}
      <Button onClick={sendAnswers}>{t("Send answers")}</Button>
    </div>
  );
}
