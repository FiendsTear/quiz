import { PrismaClient } from "@prisma/client";
import type { CreateTagDTO } from '../dto/createTagDTO';
import type { TagDTO } from '../dto/tagDTO';

const prisma = new PrismaClient();

export async function getSimilarTags(input: CreateTagDTO) {
  const tags = await prisma.tag.findMany({
    where: {
      name: {
        contains: input.name,
        mode: 'insensitive'
      },
      quizzes: {
        none: { id: input.quizID }
      }
    }
  });
  await prisma.$disconnect();
  return tags;
}

export async function createTag(input: CreateTagDTO) {
  const tag = await prisma.tag.create({
    select: {
      id: true,
    },
    data: {
      name: input.name,
      quizzes: {
        connect: { id: input.quizID },
      },
    },
  });
  return tag;
}

export async function attachTag(input: TagDTO) {
  const tag = await prisma.tag.update({
    where: {
      id: input.tagID,
    },
    data: {
      quizzes: {
        connect: { id: input.quizID },
      },
    },
  });
  return tag;
}

export async function removeTag(input: TagDTO) {
  const tag = await prisma.tag.update({
    where: {
      id: input.tagID,
    },
    data: {
      quizzes: {
        disconnect: { id: input.quizID },
      },
    },
  });
  return tag;
}