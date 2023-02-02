import { PrismaClient } from "@prisma/client";
import { QuestionDTO } from "../dto/questionDTO";

const prisma = new PrismaClient();

export async function getQuestion(questionID: number) {
  const question = await prisma.question.findFirstOrThrow({
    where: { id: questionID },
    include: { answers: true },
  });
  await prisma.$disconnect();
  return question;
}

export async function addOrUpdateQuestion(input: QuestionDTO) {
  const question = await prisma.question.upsert({
    where: { id: input.id },
    create: { body: input.body, quiz: { connect: { id: input.quizID } } },
    update: { body: input.body },
  });
  await prisma.$disconnect();
  return question;
}
