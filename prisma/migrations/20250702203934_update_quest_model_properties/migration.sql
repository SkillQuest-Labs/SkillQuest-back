/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `Quest` table. All the data in the column will be lost.
  - You are about to drop the column `isUnlocked` on the `Quest` table. All the data in the column will be lost.
  - You are about to drop the column `positionX` on the `Quest` table. All the data in the column will be lost.
  - You are about to drop the column `positionY` on the `Quest` table. All the data in the column will be lost.
  - Added the required column `position` to the `Quest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questId` to the `Quest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestStatus" AS ENUM ('LOCKED', 'UNLOCKED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Quest" DROP COLUMN "isCompleted",
DROP COLUMN "isUnlocked",
DROP COLUMN "positionX",
DROP COLUMN "positionY",
ADD COLUMN     "position" JSONB NOT NULL,
ADD COLUMN     "questId" TEXT NOT NULL,
ADD COLUMN     "status" "QuestStatus" NOT NULL DEFAULT 'LOCKED';
