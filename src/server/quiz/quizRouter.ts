import { procedure, router } from "../trpc";
import { addOrUpdateQuiz, getQuiz, getQuizzes } from "./services/quizService";
import { quizDTO } from "./dto/quizDTO";
import { questionDTO } from "./dto/questionDTO";
import { addOrUpdateQuestion } from "./services/questionService";
import { createAnswerDTO } from "./dto/createAnswerDTO";
import { addAnswer } from "./services/answerService";
import { z } from "zod";
export const quizRouter = router({
  addOrUpdateQuiz: procedure.input(quizDTO).mutation(({ input }) => addOrUpdateQuiz(input)),
  getQuiz: procedure.input(z.string()).query(({ input }) => getQuiz(input)),
  getQuizzes: procedure.query(() => getQuizzes()),
  addOrUpdateQuestion: procedure
    .input(questionDTO)
    .mutation(({ input }) => addOrUpdateQuestion(input)),
  addAnswer: procedure
    .input(createAnswerDTO)
    .mutation(({ input }) => addAnswer(input)),
});
// export type definition of API
