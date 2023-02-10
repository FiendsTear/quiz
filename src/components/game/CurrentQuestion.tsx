import { Question, Answer } from "@prisma/client";

type QuestionData = Question & {
  answers: Answer[];
};

export default function CurrentQuestion(props: { questionData: QuestionData }) {
  const { questionData } = props;
  return (
    <div>
      <div>{questionData.body}</div>
      {questionData.answers.map((answer) => (
        <div key={answer.id}>{answer.body}</div>
      ))}
    </div>
  );
}
