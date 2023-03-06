import { PrismaClient } from "@prisma/client";
import type { AnswerDTO } from "../dto/createAnswerDTO";
import { unpuplishQuiz } from "./quizService";

const prisma = new PrismaClient();

export async function getAnswer(answerID: number) {
  const answer = await prisma.answer.findUnique({
    where: { id: answerID },
  });
  return answer;
}

export async function addOrUpdateAnswer(input: AnswerDTO) {
  const { body, isCorrect } = input;
  const answer = await prisma.answer.upsert({
    where: { id: input.id },
    create: {
      body,
      isCorrect,
      question: { connect: { id: input.questionID } },
    },
    update: { body, isCorrect },
    include: {
      question: { include: { quiz: true } },
    },
  });
  if (answer.question.quiz.isPublished)
    await unpuplishQuiz(answer.question.quiz.id);
  return answer;
}

export async function deleteAnswer(answerID: number) {
  const answer = await prisma.answer.delete({
    where: { id: answerID },
    include: {
      question: { include: { quiz: true } },
    },
  });
  if (answer.question.quiz.isPublished)
    await unpuplishQuiz(answer.question.quiz.id);
  return answer;
}
