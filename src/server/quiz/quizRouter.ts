import { procedure, router } from "../trpc";
import { addQuiz, getQuiz, getQuizzes } from "./services/quizService";
import { quizDTO } from "./dto/quizDTO";
import { createQuestionDTO } from "./dto/createQuestionDTO";
import { addQuestion } from "./services/questionService";
import { createAnswerDTO } from "./dto/createAnswerDTO";
import { addAnswer } from "./services/answerService";
import { z } from "zod";
export const quizRouter = router({
  addQuiz: procedure.input(quizDTO).mutation(({ input }) => addQuiz(input)),
  getQuiz: procedure.input(z.number()).query(({ input }) => getQuiz(input)),
  getQuizzes: procedure.query(() => getQuizzes()),
  addQuestion: procedure
    .input(createQuestionDTO)
    .mutation(({ input }) => addQuestion(input)),
  addAnswer: procedure
    .input(createAnswerDTO)
    .mutation(({ input }) => addAnswer(input)),
});
// export type definition of API
