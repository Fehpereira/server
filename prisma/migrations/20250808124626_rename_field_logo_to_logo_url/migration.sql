/*
  Warnings:

  - You are about to drop the column `logo` on the `enterprises` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "enterprises" DROP COLUMN "logo",
ADD COLUMN     "logoUrl" TEXT;
