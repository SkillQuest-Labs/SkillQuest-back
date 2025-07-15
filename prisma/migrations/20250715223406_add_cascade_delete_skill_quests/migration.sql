-- DropForeignKey
ALTER TABLE "Quest" DROP CONSTRAINT "Quest_skillId_fkey";

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
