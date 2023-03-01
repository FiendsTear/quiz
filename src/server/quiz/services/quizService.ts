import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { QuizDTO } from "../dto/quizDTO";
import type { Session } from "next-auth";

const prisma = new PrismaClient();

export async function addOrUpdateQuiz(input: QuizDTO, session: Session) {
  const { isPublished, isPrivate, name } = input;
  if (name) {
    const quiz = await prisma.quiz.upsert({
      where: { id: input.id },
      update: {
        name,
        isPrivate,
        isPublished,
        userId: session.user.id
      },
      create: { name, userId: session.user.id },
    });
    return quiz;
  }
  else {
    const quiz = await prisma.quiz.update({
      where: { id: input.id },
      data: {
        isPrivate,
        isPublished,
        userId: session.user.id
      }
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
  });
  await prisma.$disconnect();
  return quizzes;
}

export async function getQuiz(quizID: string) {
  const quiz = await prisma.quiz.findFirstOrThrow({
    where: { id: +quizID },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  return quiz;
}
