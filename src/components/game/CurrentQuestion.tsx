import { trpc } from "@/utils/trpc";
import { Question, Answer } from "@prisma/client";
import { useRouter } from "next/router";

type QuestionData = Question & {
  answers: Answer[];
};

export default function CurrentQuestion(props: { questionData: QuestionData }) {
  const { questionData } = props;
  const { query } = useRouter();

  const answerMutation = trpc.game.answer.useMutation();

  function handleAnswerClick(answerID: number) {
    answerMutation.mutate({ gameID: Number(query.id), answerID });
  }

  return (
    <div>
      <div>{questionData.body}</div>
      {questionData.answers.map((answer) => (
        <div key={answer.id} onClick={() => handleAnswerClick(answer.id)}>
          {answer.body}
        </div>
      ))}
    </div>
  );
}
