import type { Prisma } from "@prisma/client";
import type { QuizDTO } from "../dto/quizDTO";
import type { FilterQuizDTO } from "../dto/filterQuizDTO";
import type { Session } from "next-auth";
import { prisma } from "../../db";
import { TRPCError } from "@trpc/server";

export async function createQuiz(session: Session) {
  const userQuizzesCount = await prisma.quiz.count({
    where: { userId: session.user.id },
  });
  const maxQuizzes = 3;
  if (userQuizzesCount >= maxQuizzes)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `You can't have more than ${maxQuizzes} quizzes`,
    });
  const quiz = await prisma.quiz.create({
    data: { name: "my new quiz", userId: session.user.id },
  });
  return quiz;
}

export async function addOrUpdateQuiz(input: QuizDTO, session: Session) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: input.id, AND: { userId: session.user.id } },
  });
  if (!quiz)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "This quiz is not yours",
    });
  const { isPublished, isPrivate, name } = input;
  const updatedQuiz = await prisma.quiz.update({
    where: { id: input.id },
    data: {
      name,
      isPrivate,
      isPublished,
    },
  });
  return updatedQuiz;
}

export async function unpublishQuiz(quizID: number) {
  const quiz = await prisma.quiz.update({
    where: { id: quizID },
    data: { isPublished: false },
  });
  return quiz;
}

export async function getQuizzes(where?: Prisma.QuizWhereInput) {
  const quizzes = await prisma.quiz.findMany({
    where,
    orderBy: { id: "asc" },
    include: { tags: true },
  });
  await prisma.$disconnect();
  return quizzes;
}

export async function getQuiz(quizID: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: +quizID },
    include: {
      questions: { select: { id: true }, orderBy: { order: "asc" } },
      tags: true,
    },
  });
  if (!quiz) return undefined;
  return quiz;
}

export async function filterQuizzes(
  input: FilterQuizDTO,
  where?: Prisma.QuizWhereInput
) {
  const { tags, quizName } = input;
  const filterTags: Prisma.QuizWhereInput = tags.length
    ? {
        tags: {
          some: {
            id: { in: tags.map((tag) => tag.id) },
          },
        },
      }
    : {};

  const filterName: Prisma.QuizWhereInput = quizName.length
    ? {
        name: {
          contains: quizName,
          mode: "insensitive",
        },
      }
    : {};

  const quizzes = await prisma.quiz.findMany({
    where: {
      ...where,
      ...filterTags,
      ...filterName,
    },
    orderBy: { id: "asc" },
    include: { tags: true },
  });
  await prisma.$disconnect();
  return quizzes;
}

export async function deleteQuiz(quizID: number) {
  await prisma.quiz.delete({ where: { id: quizID } });
}
