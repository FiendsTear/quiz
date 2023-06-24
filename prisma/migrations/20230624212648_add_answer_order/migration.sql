/*
  Warnings:

  - Added the required column `order` to the `Answer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "order" INTEGER NOT NULL;
