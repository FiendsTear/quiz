import { procedure, router } from "../trpc";
import { addOrUpdateQuiz, getQuiz, getQuizzes } from "./services/quizService";
import { quizDTO } from "./dto/quizDTO";
import { questionDTO } from "./dto/questionDTO";
import { addOrUpdateQuestion, getQuestion } from "./services/questionService";
import { answerDTO } from "./dto/createAnswerDTO";
import { addOrUpdateAnswer } from "./services/answerService";
import { z } from "zod";
export const quizRouter = router({
  // quizzes
  getQuizzes: procedure.query(() => getQuizzes()),
  getQuiz: procedure.input(z.string()).query(({ input }) => getQuiz(input)),
  addOrUpdateQuiz: procedure
    .input(quizDTO)
    .mutation(({ input }) => addOrUpdateQuiz(input)),

  //questions
  getQuestion: procedure
    .input(z.number())
    .query(({ input }) => getQuestion(input)),
  addOrUpdateQuestion: procedure
    .input(questionDTO)
    .mutation(({ input }) => addOrUpdateQuestion(input)),
  addOrUpdateAnswer: procedure
    .input(answerDTO)
    .mutation(({ input }) => addOrUpdateAnswer(input)),
});
// export type definition of API
