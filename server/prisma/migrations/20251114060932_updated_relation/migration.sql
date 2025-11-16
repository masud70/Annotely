/*
  Warnings:

  - You are about to drop the column `filePath` on the `file` table. All the data in the column will be lost.
  - You are about to drop the `filelabel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rowconfig` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[fileId,name]` on the table `Label` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileId` to the `Label` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `filelabel` DROP FOREIGN KEY `FileLabel_fileId_fkey`;

-- DropForeignKey
ALTER TABLE `filelabel` DROP FOREIGN KEY `FileLabel_labelId_fkey`;

-- DropForeignKey
ALTER TABLE `rowconfig` DROP FOREIGN KEY `RowConfig_fileId_fkey`;

-- DropIndex
DROP INDEX `Label_name_key` ON `label`;

-- AlterTable
ALTER TABLE `file` DROP COLUMN `filePath`,
    ADD COLUMN `defaultColor` VARCHAR(191) NOT NULL DEFAULT '#DEAF05';

-- AlterTable
ALTER TABLE `label` ADD COLUMN `fileId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `filelabel`;

-- DropTable
DROP TABLE `rowconfig`;

-- CreateTable
CREATE TABLE `Row` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileId` INTEGER NOT NULL,
    `rowIndex` INTEGER NOT NULL,
    `data` JSON NOT NULL,

    UNIQUE INDEX `Row_fileId_rowIndex_key`(`fileId`, `rowIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Label_fileId_name_key` ON `Label`(`fileId`, `name`);

-- AddForeignKey
ALTER TABLE `Label` ADD CONSTRAINT `Label_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Row` ADD CONSTRAINT `Row_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
