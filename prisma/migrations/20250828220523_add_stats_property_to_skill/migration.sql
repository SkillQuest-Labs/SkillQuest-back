-- AlterTable
ALTER TABLE "public"."Skill" ADD COLUMN     "averageQuestXp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "completedQuests" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalXp" INTEGER NOT NULL DEFAULT 0;
