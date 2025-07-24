/*
  Warnings:

  - Added the required column `parentSkillId` to the `QuestRelation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuestRelation" DROP CONSTRAINT "QuestRelation_childQuestId_fkey";

-- DropForeignKey
ALTER TABLE "QuestRelation" DROP CONSTRAINT "QuestRelation_parentQuestId_fkey";

-- AlterTable
ALTER TABLE "QuestRelation" ADD COLUMN     "parentSkillId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "QuestRelation" ADD CONSTRAINT "QuestRelation_parentQuestId_fkey" FOREIGN KEY ("parentQuestId") REFERENCES "Quest"("questId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestRelation" ADD CONSTRAINT "QuestRelation_parentSkillId_fkey" FOREIGN KEY ("parentSkillId") REFERENCES "Skill"("skillId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestRelation" ADD CONSTRAINT "QuestRelation_childQuestId_fkey" FOREIGN KEY ("childQuestId") REFERENCES "Quest"("questId") ON DELETE CASCADE ON UPDATE CASCADE;
