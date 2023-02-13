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
      <div className="text-center">{questionData.body}</div>
      <ul className="grid grid-cols-1 gap-3 justify-center">
        {questionData.answers.map((answer) => (
          <li
            className=""
            key={answer.id}
            onClick={() => handleAnswerClick(answer.id)}
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
