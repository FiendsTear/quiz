import { protectedProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { addOrUpdateQuiz, getQuiz, getQuizzes, filterQuizzes } from "./services/quizService";
import { quizDTO } from "./dto/quizDTO";
import { questionDTO } from "./dto/questionDTO";
import {
  addOrUpdateQuestion,
  deleteQuestion,
  getQuestion,
} from "./services/questionService";
import { answerDTO } from "./dto/createAnswerDTO";
import { addOrUpdateAnswer, deleteAnswer } from "./services/answerService";
import { filterQuizDTO } from './dto/filterQuizDTO';
import { createTagDTO } from './dto/createTagDTO';
import { tagDTO } from './dto/tagDTO';
import { getSimilarTags, createTag, attachTag, removeTag, getTags } from './services/tagService';
import { z } from "zod";
export const quizRouter = createTRPCRouter({
  // quizzes
  getQuizzes: publicProcedure.query(() => getQuizzes()),
  getUserQuizzes: protectedProcedure.query(({ ctx }) =>
    getQuizzes({ userId: ctx.session.user.id })
  ),
  getPublishedQuizzes: protectedProcedure
    .input(filterQuizDTO)
    .query(async ({ input }) => {
      return await filterQuizzes(input, {
      isPublished: true,
      isPrivate: false,
    });
  }),
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

  //tags
  getSimilarTags: protectedProcedure
    .input(createTagDTO)
    .query(({ input }) => getSimilarTags(input)),
  getTags: protectedProcedure
    .input(z.string())
    .query(({ input }) => getTags(input)),
  createTag: protectedProcedure
    .input(createTagDTO)
    .mutation(({ input }) => createTag(input)),
  attachTag: protectedProcedure
    .input(tagDTO)
    .mutation(({ input }) => attachTag(input)),
  removeTag: protectedProcedure
    .input(tagDTO)
    .mutation(({ input }) => removeTag(input)),
});
// export type definition of API
