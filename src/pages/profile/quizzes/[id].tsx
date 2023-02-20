import React, { useState } from "react";
import { trpc } from "../../../utils/trpc";
import type { QuizDTO } from "../../../server/quiz/dto/quizDTO";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import debounce from "lodash.debounce";
import type { Question } from "@prisma/client";
import QuestionEditor from "../../../modules/quiz/QuestionEditor";

export default function NewQuizPage() {
  const { query, isReady, push } = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const { register } = useForm<QuizDTO>();

  const quizID = query.id as string;

  const getQuizQuery = trpc.quiz.getQuiz.useQuery(quizID, {
    enabled: isReady,
    onSuccess: (data) => setQuestions(data.questions),
  });

  const quizMutation = trpc.quiz.addOrUpdateQuiz.useMutation();

  const questionMutation = trpc.quiz.addOrUpdateQuestion.useMutation();
  if (!isReady) return <div>Загрузка</div>;

  function handleQuizChange(changedValue: Partial<QuizDTO>) {
    quizMutation.mutate({ ...{ id: +quizID }, ...changedValue }, {
      onSuccess: () => {
        refetchQuiz();
      }
    });
  }

  function handlePublish() {
    quizMutation.mutate({ id: +quizID, isPublished: true }, {
      onSuccess: () => {
        push(`/profile`).catch((err) => console.error(err));
      }
    });
  }

  function refetchQuiz() {
    getQuizQuery.refetch().catch((err) => console.error(err));
  }

  function handleNewQuestion() {
    questionMutation.mutate(
      { quizID: +quizID, order: questions.length },
      {
        onSuccess: () => {
          refetchQuiz();
        },
      }
    );
  }

  if (getQuizQuery.isLoading) return <div>Загрузка</div>;

  return (
    <article>
      <h1>Edit Quiz</h1>
      <label htmlFor="quiz-name">Quiz name</label>
      <input
        id="quiz-name"
        type="text"
        defaultValue={getQuizQuery.data?.name}
        className="mb-3"
        {...register("name", {
          onChange: debounce((e: React.ChangeEvent<HTMLInputElement>) => {
            handleQuizChange({ name: e.target.value });
          }, 700)
        })}
      ></input>
      <ul className="flex flex-col gap-5">
        {questions.map((question) => {
          return (
            <QuestionEditor
              key={question.id}
              question={question}
              refetchQuiz={refetchQuiz}
            ></QuestionEditor>
          );
        })}
      </ul>
      <div className="flex justify-between">
        <button type="button" onClick={handleNewQuestion}>
          Add Question
        </button>
        <div className="flex items-center gap-2">
          <input 
            id="quiz-isPrivate"
            type="checkbox"
            defaultChecked={getQuizQuery.data?.isPrivate}
            {...register(`isPrivate`, {
              onChange: debounce(
                (e: React.ChangeEvent<HTMLInputElement>) =>
                  handleQuizChange({ isPrivate: e.target.checked }),
                500
              ),
            })}
          ></input>
          <label htmlFor="quiz-isPrivate">Private Quiz</label>
          <button disabled={getQuizQuery.data?.isPublished} type="button" onClick={handlePublish}>
            Publish Quiz
          </button>
        </div>
      </div>
    </article>
  );
}
