import { protectedProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { addOrUpdateQuiz, getQuiz, getQuizzes } from "./services/quizService";
import { quizDTO } from "./dto/quizDTO";
import { questionDTO } from "./dto/questionDTO";
import {
  addOrUpdateQuestion,
  deleteQuestion,
  getQuestion,
} from "./services/questionService";
import { answerDTO } from "./dto/createAnswerDTO";
import { addOrUpdateAnswer, deleteAnswer } from "./services/answerService";
import { z } from "zod";
export const quizRouter = createTRPCRouter({
  // quizzes
  getQuizzes: publicProcedure.query(() => getQuizzes()),
  getUserQuizzes: protectedProcedure.query(({ ctx }) =>
    getQuizzes({ userId: ctx.session.user.id })
  ),
  getPublishedQuizzes: protectedProcedure.query(() =>
    getQuizzes({
      isPublished: true,
      isPrivate: false,
    })
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
  deleteQuestion: protectedProcedure
    .input(z.number())
    .mutation(({ input }) => deleteQuestion(input)),

  addOrUpdateAnswer: protectedProcedure
    .input(answerDTO)
    .mutation(({ input }) => addOrUpdateAnswer(input)),
  deleteAnswer: protectedProcedure
    .input(z.number())
    .mutation(({ input }) => deleteAnswer(input)),
});
// export type definition of API
