-- DropForeignKey
ALTER TABLE "Avatar" DROP CONSTRAINT "Avatar_userId_fkey";

-- DropForeignKey
ALTER TABLE "Quest" DROP CONSTRAINT "Quest_skillId_fkey";

-- DropForeignKey
ALTER TABLE "QuestRelation" DROP CONSTRAINT "QuestRelation_childQuestId_fkey";

-- DropForeignKey
ALTER TABLE "QuestRelation" DROP CONSTRAINT "QuestRelation_parentQuestId_fkey";

-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserStats" DROP CONSTRAINT "UserStats_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserTrophy" DROP CONSTRAINT "UserTrophy_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkSession" DROP CONSTRAINT "WorkSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkSessionQuest" DROP CONSTRAINT "WorkSessionQuest_questId_fkey";

-- DropForeignKey
ALTER TABLE "WorkSessionQuest" DROP CONSTRAINT "WorkSessionQuest_workSessionId_fkey";

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestRelation" ADD CONSTRAINT "QuestRelation_parentQuestId_fkey" FOREIGN KEY ("parentQuestId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestRelation" ADD CONSTRAINT "QuestRelation_childQuestId_fkey" FOREIGN KEY ("childQuestId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTrophy" ADD CONSTRAINT "UserTrophy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSession" ADD CONSTRAINT "WorkSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSessionQuest" ADD CONSTRAINT "WorkSessionQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSessionQuest" ADD CONSTRAINT "WorkSessionQuest_workSessionId_fkey" FOREIGN KEY ("workSessionId") REFERENCES "WorkSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
