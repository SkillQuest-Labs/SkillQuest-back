/*
  Warnings:

  - Added the required column `positionX` to the `Quest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionY` to the `Quest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quest" ADD COLUMN     "positionX" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "positionY" DOUBLE PRECISION NOT NULL;
