import type { ZodError } from "zod";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import produce from "immer";
import type { RouterOutputs } from "../../utils/trpc";

type Issues = ZodError["issues"];
export type QuizIssues = {
  [key in keyof NonNullable<Partial<RouterOutputs["quiz"]["getQuiz"]>>]: string;
};
export type AnswerIssues = {
  [key in keyof NonNullable<
    Partial<RouterOutputs["quiz"]["getAnswer"]>
  >]: string;
};
export type QuestionIssues = {
  [key in keyof NonNullable<
    Partial<RouterOutputs["quiz"]["getQuestion"]>
  >]: string;
};
interface QuizFormState {
  quizErrors: QuizIssues;
  questionsErrors: { [id: number]: QuestionIssues };
  answersErrors: { [id: number]: AnswerIssues };
  setAnswerError: { (answerID: number, errors: Issues): void };
  setQuestionError: { (questionID: number, errors: Issues): void };
  setQuizError: { (errors: Issues): void };
  //   updateAnswerError: { (answerID: number, errors: Issues): void };
  //   updateQuestionError: { (questionID: number, errors: Issues): void };
  //   updateQuizError: { (errors: Issues): void };
}

export const useQuizStore = create<QuizFormState>()(
  devtools((set) => ({
    quizErrors: {},
    questionsErrors: [],
    answersErrors: [],
    setAnswerError: (answerID, issues) => {
      set(
        produce<QuizFormState>((draft) => {
          const answerIssues: AnswerIssues = {};
          issues.forEach((issue) => {
            const path = issue.path[issue.path.length - 1];
            answerIssues[
              issue.path[issue.path.length - 1] as keyof AnswerIssues
            ] = issue.message;
          });
          draft.answersErrors[answerID] = answerIssues;
        })
      );
    },
    setQuestionError: (questionID, issues) => {
      set(
        produce<QuizFormState>((draft) => {
          const questionIssues: QuestionIssues = {};
          issues.forEach((issue) => {
            questionIssues[
              issue.path[issue.path.length - 1] as keyof QuestionIssues
            ] = issue.message;
          });
          draft.questionsErrors[questionID] = questionIssues;
        })
      );
    },
    setQuizError: (issues) => {
      set(
        produce<QuizFormState>((draft) => {
          const quizIssues: QuizIssues = {};
          issues.forEach((issue) => {
            quizIssues[issue.path[issue.path.length - 1] as keyof QuizIssues] =
              issue.message;
          });
          draft.quizErrors = quizIssues;
        })
      );
    },
  }))
);
