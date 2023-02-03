-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('CREATED', 'STARTED', 'FINISHED');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'CREATED';
