/*
  Warnings:

  - Added the required column `xp` to the `Quest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quest" ADD COLUMN     "xp" INTEGER NOT NULL;
