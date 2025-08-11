/*
  Warnings:

  - You are about to drop the column `enterpriseId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `enterpriseName` on the `products` table. All the data in the column will be lost.
  - Added the required column `enterprise_id` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_enterpriseId_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "enterpriseId",
DROP COLUMN "enterpriseName",
ADD COLUMN     "enterprise_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
