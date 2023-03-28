-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_quizID_fkey";

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizID_fkey" FOREIGN KEY ("quizID") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
