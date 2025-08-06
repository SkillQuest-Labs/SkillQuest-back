/*
  Warnings:

  - You are about to drop the `WorkSessionQuest` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `questId` to the `WorkSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WorkSessionQuest" DROP CONSTRAINT "WorkSessionQuest_questId_fkey";

-- DropForeignKey
ALTER TABLE "WorkSessionQuest" DROP CONSTRAINT "WorkSessionQuest_workSessionId_fkey";

-- AlterTable
ALTER TABLE "WorkSession" ADD COLUMN     "questId" TEXT NOT NULL;

-- DropTable
DROP TABLE "WorkSessionQuest";

-- AddForeignKey
ALTER TABLE "WorkSession" ADD CONSTRAINT "WorkSession_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
