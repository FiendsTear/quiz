-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_quizID_fkey";

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_quizID_fkey" FOREIGN KEY ("quizID") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
