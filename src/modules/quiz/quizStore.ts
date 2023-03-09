import { ZodError } from "zod";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import produce from "immer";

type Issues = ZodError["issues"];
interface PropIssue {
  [propName: string]: string;
}
interface ErrorsByID {
  [id: number]: PropIssue;
}
interface QuizFormState {
  quizErrors: PropIssue;
  questionsErrors: ErrorsByID;
  answersErrors: ErrorsByID;
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
          const answerIssues: PropIssue = {};
          issues.forEach((issue) => {
            answerIssues[issue.path[issue.path.length - 1]] = issue.message;
          });
          draft.answersErrors[answerID] = answerIssues;
        })
      );
    },
    setQuestionError: (questionID, issues) => {
      set(
        produce<QuizFormState>((draft) => {
          const questionIssues: PropIssue = {};
          issues.forEach((issue) => {
            questionIssues[issue.path[issue.path.length - 1]] = issue.message;
          });
          draft.questionsErrors[questionID] = questionIssues;
        })
      );
    },
    setQuizError: (issues) => {
      set(
        produce<QuizFormState>((draft) => {
          const quizIssues: PropIssue = {};
          issues.forEach((issue) => {
            quizIssues[issue.path[issue.path.length - 1]] = issue.message;
          });
          draft.quizErrors = quizIssues;
        })
      );
    },
  }))
);
