import { protectedProcedure, createTRPCRouter, publicProcedure } from "../trpc.js";
import {
  addOrUpdateQuiz,
  getQuiz,
  getQuizzes,
  filterQuizzes,
  createQuiz,
  deleteQuiz,
} from "./services/quizService.js";
import { quizDTO } from "./dto/quizDTO.js";
import { questionDTO } from "./dto/questionDTO.js";
import {
  addOrUpdateQuestion,
  deleteQuestion,
  getQuestion,
} from "./services/questionService.js";
import { answerDTO } from "./dto/createAnswerDTO.js";
import {
  addOrUpdateAnswer,
  deleteAnswer,
  getAnswer,
} from "./services/answerService.js";
import { filterQuizDTO } from "./dto/filterQuizDTO.js";
import { createTagDTO } from "./dto/createTagDTO.js";
import { tagDTO } from "./dto/tagDTO.js";
import {
  getSimilarTags,
  createTag,
  attachTag,
  removeTag,
  getTags,
} from "./services/tagService.js";
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
  createQuiz: protectedProcedure.mutation(({ ctx }) => createQuiz(ctx.session)),
  addOrUpdateQuiz: protectedProcedure
    .input(quizDTO)
    .mutation(({ input, ctx }) => addOrUpdateQuiz(input, ctx.session)),
  deleteQuiz: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      await deleteQuiz(input);
    }),

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

  //answers
  getAnswer: protectedProcedure
    .input(z.number())
    .query(({ input }) => getAnswer(input)),
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
