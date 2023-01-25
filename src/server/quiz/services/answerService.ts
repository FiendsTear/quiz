import { PrismaClient } from "@prisma/client";
import { CreateAnswerDTO } from "../dto/createAnswerDTO";

const prisma = new PrismaClient();

export async function addAnswer(input: CreateAnswerDTO) {
  const answer = await prisma.answer.create({
    data: {
      body: input.body,
      isCorrect: input.isCorrect,
      question: {
        connect: { id: input.questionID },
      },
    },
  });
  await prisma.$disconnect();
  return answer;
}
