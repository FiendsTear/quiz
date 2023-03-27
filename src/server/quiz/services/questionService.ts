import type { QuestionDTO } from "../dto/questionDTO";
import { unpublishQuiz } from "./quizService";
import { prisma } from "../../db";
import { omit } from "lodash";

export async function getQuestion(questionID: number) {
  const question = await prisma.question.findUnique({
    where: { id: questionID },
    include: { answers: { select: { id: true } } },
  });
  if (!question) return undefined;
  return question;
}

export async function addOrUpdateQuestion(input: QuestionDTO) {
  const question = await prisma.question.upsert({
    where: { id: input.id },
    create: {
      body: input.body,
      // this here to make compiler stop complaining, should be re-done
      order: input.order ? input.order : 0,
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
  const response = omit(question, "quiz");
  return response;
}

export async function deleteQuestion(questionID: number) {
  const question = await prisma.question.delete({
    where: { id: questionID },
    include: { quiz: true },
  });
  if (question.quiz.isPublished) await unpublishQuiz(question.quiz.id);
  return question;
}
