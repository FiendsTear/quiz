import { PrismaClient } from "@prisma/client";
import { AnswerDTO } from "../dto/createAnswerDTO";

const prisma = new PrismaClient();

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
    include: { question: true },
  });
  return answer;
}
