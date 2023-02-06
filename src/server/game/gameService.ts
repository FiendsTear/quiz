import { GameStatus, PrismaClient } from "@prisma/client";
import { GameDTO } from "./dto/createGameDTO";
import { updateGameDTO, UpdateGameDTO } from "./dto/updateGameDTO";

const prisma = new PrismaClient();

export async function getGame(id: number) {
  const game = await prisma.game.findFirstOrThrow({
    where: { id },
    include: { quiz: { include: { questions: true } } },
  });
  await prisma.$disconnect();
  return game;
}

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

export async function updateGame(dto: UpdateGameDTO) {
  const game = await prisma.game.update({
    where: { id: dto.id },
    data: { status: dto.status },
  });
}

export async function getGames(gameIDs: number[]) {
  return await prisma.game.findMany({
    where: { id: { in: gameIDs }, status: GameStatus.CREATED },
  });
}
