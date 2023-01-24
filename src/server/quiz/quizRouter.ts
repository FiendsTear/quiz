import { z } from "zod";
import { procedure, router } from "../trpc";
import { addQuiz, getQuizzes } from "./services/quizService";
export const quizRouter = router({
  addQuiz: procedure.input(z.string()).mutation(({ input }) => addQuiz()),
  getQuizzes: procedure.query(() => getQuizzes()),
});
// export type definition of API
