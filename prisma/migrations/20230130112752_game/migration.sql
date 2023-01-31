-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "quizID" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_id_key" ON "Game"("id");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_quizID_fkey" FOREIGN KEY ("quizID") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
