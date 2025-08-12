-- DropForeignKey
ALTER TABLE "WorkSession" DROP CONSTRAINT "WorkSession_linkedSkillId_fkey";

-- AddForeignKey
ALTER TABLE "WorkSession" ADD CONSTRAINT "WorkSession_linkedSkillId_fkey" FOREIGN KEY ("linkedSkillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
