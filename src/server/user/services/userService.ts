import { PrismaClient } from "@prisma/client";
import { CreateUserDTO } from "../dto.ts/createUserDTO";

const prisma = new PrismaClient();

export async function addUser(input: CreateUserDTO) {
  const user = await prisma.user.create({
    data: input,
  });
  await prisma.$disconnect();
  return user;
}
