import { publicProcedure, createTRPCRouter } from "../trpc";
import { addOrUpdateQuiz, getQuiz, getQuizzes } from "./services/quizService";
import { quizDTO } from "./dto/quizDTO";
import { questionDTO } from "./dto/questionDTO";
import { addOrUpdateQuestion, getQuestion } from "./services/questionService";
import { answerDTO } from "./dto/createAnswerDTO";
import { addOrUpdateAnswer } from "./services/answerService";
import { z } from "zod";
export const quizRouter = createTRPCRouter({
  // quizzes
  getQuizzes: publicProcedure.query(() => getQuizzes()),
  getQuiz: publicProcedure.input(z.string()).query(({ input }) => getQuiz(input)),
  addOrUpdateQuiz: publicProcedure
    .input(quizDTO)
    .mutation(({ input }) => addOrUpdateQuiz(input)),

  //questions
  getQuestion: publicProcedure
    .input(z.number())
    .query(({ input }) => getQuestion(input)),
  addOrUpdateQuestion: publicProcedure
    .input(questionDTO)
    .mutation(({ input }) => addOrUpdateQuestion(input)),
  addOrUpdateAnswer: publicProcedure
    .input(answerDTO)
    .mutation(({ input }) => addOrUpdateAnswer(input)),
});
// export type definition of API
