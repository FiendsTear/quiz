import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface MappedErrors {
  [id: number]: PropError;
}
interface PropError {
  [propName: string]: string;
}
interface QuizFormState {
  quizErrors: PropError;
  questionsErrors: MappedErrors;
  answersErrors: MappedErrors;
  //   setError: { (path: string[], message: string): void };
}

export const useQuizStore = create<QuizFormState>()(
  devtools((set) => ({
    quizErrors: {},
    questionsErrors: [],
    answersErrors: [],
    // setError: (path, message) => {
    //   set();
    // },
  }))
);
