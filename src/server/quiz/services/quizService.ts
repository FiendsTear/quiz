import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function addQuiz() {
  const quiz = await prisma.quiz.create({
    data: {
      name: "something",
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
