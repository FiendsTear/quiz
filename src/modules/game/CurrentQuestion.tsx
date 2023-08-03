import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import Timer from "./Timer";
import { RouterOutputs } from "../../utils/trpc";
import Button, { ButtonVariant } from "../../common/components/Button";

type QuestionData = RouterOutputs["game"]["getGameState"]["currentQuestion"];

export default function CurrentQuestion(props: {
  questionData: QuestionData;
  isHost?: boolean;
  warned?: boolean;
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

  useEffect(() => {
    // something like anti-cheat system - send empty answer if user leaves game page
    if (props.warned === true) {
      document.onvisibilitychange = () => {
        if (!answerSent) {
          setSelectedAnswers([]);
          sendAnswers();
        }
      };
      window.onblur = () => {
        if (!answerSent) {
          setSelectedAnswers([]);
          sendAnswers();
        }
      };
    }
  }, [props.warned]);

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
    <div className="flex flex-col justify-between h-full w-2/3 mx-auto">
      <div className="grow flex justify-center items-center text-3xl">
        {questionData.body}
      </div>
      <ul className="grid grid-cols-2 gap-3 justify-center">
        {questionData.answers.map((answer) => (
          <li key={answer.id}>
            <Button
              variant={ButtonVariant.SELECTION}
              selected={selectedAnswersID.includes(answer.id)}
              onClick={() => selectAnswer(answer.id)}
              attr={{ className: "w-full py-3 text-lg" }}
            >
              {answer.body}
            </Button>
          </li>
        ))}
      </ul>
      <Timer
        secondsToExpire={questionData.timerValue}
        onExpire={() => sendAnswers()}
      />
      <Button onClick={sendAnswers} attr={{ className: "text-lg" }}>
        {t("Send answers")}
      </Button>
    </div>
  );
}
