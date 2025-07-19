/*
  Warnings:

  - A unique constraint covering the columns `[questId]` on the table `Quest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[questRelationId]` on the table `QuestRelation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[skillId]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Quest_questId_key" ON "Quest"("questId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestRelation_questRelationId_key" ON "QuestRelation"("questRelationId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_skillId_key" ON "Skill"("skillId");
