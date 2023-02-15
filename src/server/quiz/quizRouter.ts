import { protectedProcedure, createTRPCRouter, publicProcedure } from "../trpc";
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
  getUserQuizzes: protectedProcedure.query(({ ctx }) =>
    getQuizzes({ userId: ctx.session.user.id })
  ),
  getQuiz: protectedProcedure
    .input(z.string())
    .query(({ input }) => getQuiz(input)),
  addOrUpdateQuiz: protectedProcedure
    .input(quizDTO)
    .mutation(({ input, ctx }) => addOrUpdateQuiz(input, ctx.session)),

  //questions
  getQuestion: protectedProcedure
    .input(z.number())
    .query(({ input }) => getQuestion(input)),
  addOrUpdateQuestion: protectedProcedure
    .input(questionDTO)
    .mutation(({ input }) => addOrUpdateQuestion(input)),
  addOrUpdateAnswer: protectedProcedure
    .input(answerDTO)
    .mutation(({ input }) => addOrUpdateAnswer(input)),
});
// export type definition of API
