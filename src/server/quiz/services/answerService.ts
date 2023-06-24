import type { CreateAnswerDTO } from "../dto/createAnswerDTO.js";
import { unpublishQuiz } from "./quizService.js";
import { prisma } from "../../db.js";
import lodash from "lodash";
import { UpdateAnswerDTO } from "../dto/updateAnswerDTO.js";

export async function getAnswer(answerID: number) {
  const answer = await prisma.answer.findUnique({
    where: { id: answerID },
  });
  if (!answer) return undefined;
  return answer;
}

export async function createAnswer(input: CreateAnswerDTO) {
  const answer = await prisma.answer.create({
    data: {
      question: { connect: { id: input.questionID } },
      order: input.order
    },
    select: {
      question: {
        include: {
          quiz: { select: { id: true, isPublished: true } },
          answers: { select: { isCorrect: true } },
        },
      },
    },
  });
  if (answer.question.quiz.isPublished)
    await unpublishQuiz(answer.question.quiz.id);
  const response = lodash.omit(answer, "question");
  return response;
}

export async function updateAnswer(input: UpdateAnswerDTO) {
  const { body, isCorrect } = input;
  const answer = await prisma.answer.update({
    where: { id: input.id },
    data: { body, isCorrect },
    include: {
      question: {
        include: {
          quiz: { select: { id: true, isPublished: true } },
          answers: { select: { isCorrect: true } },
        },
      },
    },
  })
  if (answer.question.quiz.isPublished)
    await unpublishQuiz(answer.question.quiz.id);
  const response = lodash.omit(answer, "question");
  return response;
}

export async function deleteAnswer(answerID: number) {
  const answer = await prisma.answer.delete({
    where: { id: answerID },
    include: {
      question: { include: { quiz: true } },
    },
  });
  if (answer.question.quiz.isPublished)
    await unpublishQuiz(answer.question.quiz.id);
  return answer;
}
