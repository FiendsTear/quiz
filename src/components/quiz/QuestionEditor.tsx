import { trpc } from "../../utils/trpc";

export default function QuestionEditor() {
  const mutation = trpc.quiz.addOrUpdateQuestion.useMutation();
  
  return <div>Вопрос</div>;
}
