import React, { SyntheticEvent, useState } from "react";
import { trpc } from "../../../utils/trpc";
import { QuizDTO } from "../../../server/quiz/dto/quizDTO";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import debounce from "lodash.debounce";
import { Question, Quiz } from "@prisma/client";
import QuestionEditor from "../../../components/quiz/QuestionEditor";

export default function NewQuizPage() {
  const { query, isReady } = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const { register, handleSubmit } = useForm<QuizDTO>();

  const quizID = query.id as string;

  const getQuizQuery = trpc.quiz.getQuiz.useQuery(quizID, {
    enabled: isReady,
    onSuccess: (data) => setQuestions(data.questions),
  });

  const quizMutation = trpc.quiz.addOrUpdateQuiz.useMutation();

  const questionMutation = trpc.quiz.addOrUpdateQuestion.useMutation();
  if (!isReady) return <div>Загрузка</div>;

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    quizMutation.mutate({ id: +quizID, name: e.target.value });
  }

  function handleNewQuestion() {
    questionMutation.mutate(
      { quizID: +quizID, order: questions.length },
      {
        onSuccess: (data) => {
          setQuestions([...questions, data]);
        },
      }
    );
  }

  if (getQuizQuery.isLoading) return <div>Загрузка</div>;

  return (
    <article>
      <input
        type="text"
        defaultValue={getQuizQuery.data?.name}
        className="mb-5"
        {...register("name", { onChange: debounce(handleNameChange, 700) })}
      ></input>
      <ul className="flex flex-col gap-5">
        {questions.map((question) => {
          return (
            <QuestionEditor
              key={question.id}
              question={question}
            ></QuestionEditor>
          );
        })}
      </ul>
      <button type="button" onClick={handleNewQuestion}>
        Add Question
      </button>
    </article>
  );
}
