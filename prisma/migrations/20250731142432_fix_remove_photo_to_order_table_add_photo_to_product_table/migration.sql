/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "photoUrl";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "photoUrl" TEXT;
