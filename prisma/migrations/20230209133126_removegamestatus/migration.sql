/*
  Warnings:

  - You are about to drop the column `status` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "status";

-- DropEnum
DROP TYPE "GameStatus";
