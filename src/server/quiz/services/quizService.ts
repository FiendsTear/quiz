import type { Prisma } from "@prisma/client";
import type { QuizDTO } from "../dto/quizDTO";
import type { FilterQuizDTO } from "../dto/filterQuizDTO";
import type { Session } from "next-auth";
import { prisma } from "../../db";

export async function addOrUpdateQuiz(input: QuizDTO, session: Session) {
  const { isPublished, isPrivate, name } = input;
  if (name) {
    const quiz = await prisma.quiz.upsert({
      where: { id: input.id },
      update: {
        name,
        isPrivate,
        isPublished,
        userId: session.user.id,
      },
      create: { name, userId: session.user.id },
    });
    return quiz;
  } else {
    const quiz = await prisma.quiz.update({
      where: { id: input.id },
      data: {
        isPrivate,
        isPublished,
        userId: session.user.id,
      },
    });
    return quiz;
  }
}

export async function unpuplishQuiz(quizID: number) {
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
