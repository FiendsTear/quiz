import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function createGame(quizID: number) {
  const game = await prisma.game.create({
    select: {
      id: true,
      quiz: {
        include: {
          questions: { orderBy: { order: "asc" }, include: { answers: true } },
        },
      },
    },
    data: {
      quiz: {
        connect: { id: quizID },
      },
    },
  });
  return game;
}

export type GameWithAnswers = Prisma.PromiseReturnType<typeof createGame>;

export async function getGamesByID(gamesID: number[]) {
  return await prisma.game.findMany({ where: { id: { in: gamesID } } });
}
