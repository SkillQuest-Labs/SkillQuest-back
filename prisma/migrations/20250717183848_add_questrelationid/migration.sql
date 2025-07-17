/*
  Warnings:

  - Added the required column `QuestRelationId` to the `QuestRelation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuestRelation" ADD COLUMN     "QuestRelationId" TEXT NOT NULL;
