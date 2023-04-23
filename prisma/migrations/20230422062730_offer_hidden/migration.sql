/*
  Warnings:

  - Made the column `hidden` on table `offer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "offer" ALTER COLUMN "hidden" SET NOT NULL;
