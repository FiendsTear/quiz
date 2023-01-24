import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function addQuestion(input: string) {
  const user = await prisma.question.create({
    data: {
      body: "something",
      quiz: {
        connect: { id: 1 },
      },
    },
  });
  await prisma.$disconnect();
  return user;
}
