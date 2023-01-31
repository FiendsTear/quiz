import { PrismaClient } from "@prisma/client";
import { QuizDTO } from "../dto/quizDTO";

const prisma = new PrismaClient();

export async function addOrUpdateQuiz(input: QuizDTO) {
  const quiz = await prisma.quiz.upsert({
    where: { id: input.id },
    update: { name: input.name },
    create: { name: input.name }
  });
  await prisma.$disconnect();
  return quiz;
}

export async function getQuizzes() {
  const quizzes = await prisma.quiz.findMany();
  await prisma.$disconnect();
  return quizzes;
}

export async function getQuiz(quizID: string) {
  const quiz = await prisma.quiz.findFirst({ where: { id: +quizID } });
  await prisma.$disconnect();
  return quiz;
}
