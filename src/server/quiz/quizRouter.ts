import { procedure, router } from "../trpc";
import { addQuiz, getQuizzes } from "./services/quizService";
import { quizDTO } from './dto/quizDTO';
export const quizRouter = router({
  addQuiz: procedure.input(quizDTO).mutation(({ input }) => addQuiz(input)),
  getQuizzes: procedure.query(() => getQuizzes()),
});
// export type definition of API
