import { PrismaClient } from "@prisma/client";
import { QuestionDTO } from "../dto/questionDTO";

const prisma = new PrismaClient();

export async function addOrUpdateQuestion(input: QuestionDTO) {
  const question = await prisma.question.upsert({
    where: { id: input.id },
    create: { body: input.body, quiz: { connect: { id: input.quizID } } },
    update: { body: input.body }
  });
  await prisma.$disconnect();
  return question;
}
