import React, { ChangeEvent, FormEventHandler, useState } from "react";
import { trpc } from "../../utils/trpc";
import { QuizDTO } from "../../server/quiz/dto/quizDTO";

export default function NewQuizPage() {
  const [quizData, setQuizData] = useState<QuizDTO>({
    name: "",
    questions: [],
  });
  const mutation = trpc.quiz.addQuiz.useMutation();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuizData({ ...quizData, [event.target.name]: event.target.value });
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(quizData as any);
  }
  //   if (mutation.isLoading) return <div>Загрузка</div>;
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={quizData.name}
        onChange={handleChange}
      ></input>
      <ul>
        {quizData.questions.map((question) => {
          return (
            <li key={question.body}>
              <input
                type="text"
                name="body"
                value={question.body}
                onChange={handleChange}
              ></input>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() =>
          setQuizData((prevData) => ({
            ...prevData,
            questions: [...prevData.questions, { body: "" }],
          }))
        }
      >
        Добавить вопрос
      </button>
      <button type="submit">Создать</button>
    </form>
  );
}
