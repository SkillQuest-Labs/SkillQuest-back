/*
  Warnings:

  - You are about to drop the column `QuestRelationId` on the `QuestRelation` table. All the data in the column will be lost.
  - Added the required column `questRelationId` to the `QuestRelation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuestRelation" DROP COLUMN "QuestRelationId",
ADD COLUMN     "questRelationId" TEXT NOT NULL;
