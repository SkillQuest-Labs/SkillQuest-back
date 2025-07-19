/*
  Warnings:

  - Added the required column `skillId` to the `Skill` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "skillId" TEXT NOT NULL;
