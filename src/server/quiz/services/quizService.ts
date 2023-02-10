import { PrismaClient } from "@prisma/client";
import { QuizDTO } from "../dto/quizDTO";
import { Session } from 'next-auth';

const prisma = new PrismaClient();

export async function addOrUpdateQuiz(input: QuizDTO, session: Session) {
  const quiz = await prisma.quiz.upsert({
    where: { id: input.id },
    update: { name: input.name,
              userId: session.user.id },
    create: { name: input.name, 
              userId: session.user.id },
  });
  return quiz;
}

export async function getQuizzes(session: Session) {
  const quizzes = await prisma.quiz.findMany({
    where: { userId: session.user.id },
  });
  await prisma.$disconnect();
  return quizzes;
}

export async function getQuiz(quizID: string) {
  const quiz = await prisma.quiz.findFirstOrThrow({
    where: { id: +quizID },
    include: { questions: true },
  });
  return quiz;
}
