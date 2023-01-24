import { PrismaClient } from "@prisma/client";
import { QuizDTO } from "../dto/quizDTO";

const prisma = new PrismaClient();

export async function addQuiz(input: QuizDTO) {
  const quiz = await prisma.quiz.create({
    data: {
      name: input,
    },
  });
  await prisma.$disconnect();
  return quiz;
}

export async function getQuizzes() {
  const quizzes = await prisma.quiz.findMany();
  await prisma.$disconnect();
  return quizzes;
}
