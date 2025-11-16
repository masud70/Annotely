/*
  Warnings:

  - Added the required column `keyColumn` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `file` ADD COLUMN `configured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `keyColumn` VARCHAR(191) NOT NULL;
