/*
  Warnings:

  - You are about to drop the column `defaultColor` on the `file` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `file` DROP COLUMN `defaultColor`,
    ADD COLUMN `highlightColor` VARCHAR(191) NOT NULL DEFAULT '#DEAF05';
