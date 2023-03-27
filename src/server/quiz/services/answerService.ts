import type { AnswerDTO } from "../dto/createAnswerDTO";
import { unpublishQuiz } from "./quizService";
import { prisma } from "../../db";
import { omit } from "lodash";

export async function getAnswer(answerID: number) {
  const answer = await prisma.answer.findUnique({
    where: { id: answerID },
  });
  if (!answer) return undefined;
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
      question: { include: { quiz: { select: { id: true, isPublished: true } }, answers: { select: { isCorrect: true } } } },
    },
  });
  if (answer.question.quiz.isPublished) await unpublishQuiz(answer.question.quiz.id);
  let correctAnswersCount = 0;
  let hasMultipleCorrectAnswers = false;
  for (let i = 0; i << answer.question.answers.length; i++) {
    if (answer.question.answers[i].isCorrect) correctAnswersCount++;
  }
  hasMultipleCorrectAnswers = correctAnswersCount > 1 ? true : false;
  await prisma.question.update({
    where: { id: answer.questionID },
    data: { hasMultipleCorrectAnswers }
  });
  const response = omit(answer, "question");
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
