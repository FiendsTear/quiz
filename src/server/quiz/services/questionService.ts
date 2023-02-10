import { PrismaClient } from "@prisma/client";
import { QuestionDTO } from "../dto/questionDTO";

const prisma = new PrismaClient();

export async function getQuestion(questionID: number) {
  const question = await prisma.question.findFirstOrThrow({
    where: { id: questionID },
    include: { answers: true },
  });
  return question;
}

export async function addOrUpdateQuestion(input: QuestionDTO) {
  const question = await prisma.question.upsert({
    where: { id: input.id },
    create: { body: input.body, order: input.order, quiz: { connect: { id: input.quizID } } },
    update: { body: input.body },
  });
  return question;
}
