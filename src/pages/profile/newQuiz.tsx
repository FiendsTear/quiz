import React, { ChangeEvent, FormEventHandler, useState } from "react";
import { trpc } from "../../utils/trpc";

export default function NewQuizPage() {
  const [quizData, setQuizData] = useState({
    name: "",
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
      <button type="submit">Создать</button>
    </form>
  );
}
