import { PrismaClient } from "@prisma/client";
import { CreateQuestionDTO } from "../dto/createQuestionDTO";

const prisma = new PrismaClient();

export async function addQuestion(input: CreateQuestionDTO) {
  const question = await prisma.question.create({
    data: {
      body: input.body,
      quiz: {
        connect: { id: input.quizID },
      },
    },
  });
  await prisma.$disconnect();
  return question;
}
