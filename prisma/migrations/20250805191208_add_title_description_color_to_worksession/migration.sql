/*
  Warnings:

  - Added the required column `color` to the `WorkSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkedSkillId` to the `WorkSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `WorkSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkSession" ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "linkedSkillId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkSession" ADD CONSTRAINT "WorkSession_linkedSkillId_fkey" FOREIGN KEY ("linkedSkillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
