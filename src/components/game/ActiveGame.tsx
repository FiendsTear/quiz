import { Game, Quiz, Question } from "@prisma/client";

type GameData = Game & {
  quiz: Quiz & {
    questions: Question[];
  };
};

export default function ActiveGame(props: { gameData: GameData }) {
  const { gameData } = props;
  return (
    <div>
      {gameData.quiz.questions.map((question) => (
        <div key={question.id}>{question.body}</div>
      ))}
    </div>
  );
}
