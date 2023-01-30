import { PrismaClient } from "@prisma/client";
import { GameDTO } from "./createGameDTO";

const prisma = new PrismaClient();

export async function createGame(input: GameDTO) {
  const game = await prisma.game.create({
    data: {
      quiz: {
        connect: { id: input.quizID },
      },
    },
  });
  await prisma.$disconnect();
  return game;
}

export async function getGames() {
  return await prisma.game.findMany();
}
