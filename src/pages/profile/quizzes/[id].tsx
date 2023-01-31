import React, { SyntheticEvent, useState } from "react";
import { trpc } from "../../../utils/trpc";
import { QuizDTO } from "../../../server/quiz/dto/quizDTO";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import debounce from "lodash.debounce";

export default function NewQuizPage() {
  const { query, isReady } = useRouter();
  const [questions, setQuestions] = useState([]);
  const { register, handleSubmit } = useForm<QuizDTO>();

  const quizID = query.id as string;

  const getQuizQuery = trpc.quiz.getQuiz.useQuery(quizID, { enabled: isReady });
  const quizMutation = trpc.quiz.addOrUpdateQuiz.useMutation();

  const questionMutation = trpc.quiz.addOrUpdateQuestion.useMutation();
  if (!isReady) return <div>Загрузка</div>;

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    quizMutation.mutate({ id: +quizID, name: e.target.value });
  }

  function handleNewQuestion() {
    questionMutation.mutate({ quizID: +quizID }, {
      onSuccess: (data) => {setQuestions}
    });
  }

  if (getQuizQuery.isLoading) return <div>Загрузка</div>;

  return (
    <article>
      <input
        type="text"
        defaultValue={getQuizQuery.data?.name}
        {...register("name", { onChange: debounce(handleNameChange, 700) })}
      ></input>

      <button type="button" onClick={handleNewQuestion}>
        Добавить вопрос
      </button>
    </article>
  );
}
