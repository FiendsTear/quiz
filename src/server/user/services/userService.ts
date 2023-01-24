import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function addUser() {
  const user = await prisma.user.create({
    data: {
      username: "something",
      password: "something",
    },
  });
  await prisma.$disconnect();
  return user;
}
