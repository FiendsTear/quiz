import { PrismaClient } from "@prisma/client";
import type { QuestionDTO } from "../dto/questionDTO";
import { unpuplishQuiz as unpublishQuiz } from "./quizService";

const prisma = new PrismaClient();

export async function getQuestion(questionID: number) {
  const question = await prisma.question.findUniqueOrThrow({
    where: { id: questionID },
    include: { answers: { select: { id: true } } },
  });
  return question;
}

export async function addOrUpdateQuestion(input: QuestionDTO) {
  const question = await prisma.question.upsert({
    where: { id: input.id },
    create: {
      body: input.body,
      order: input.order,
      answerWeight: input.answerWeight,
      quiz: { connect: { id: input.quizID } },
    },
    update: {
      body: input.body,
      answerWeight: input.answerWeight,
    },
    include: { quiz: true },
  });
  if (question.quiz.isPublished) await unpublishQuiz(question.quiz.id);
  return question;
}

export async function deleteQuestion(questionID: number) {
  const question = await prisma.question.delete({
    where: { id: questionID },
    include: { quiz: true },
  });
  if (question.quiz.isPublished) await unpublishQuiz(question.quiz.id);
  return question;
}
