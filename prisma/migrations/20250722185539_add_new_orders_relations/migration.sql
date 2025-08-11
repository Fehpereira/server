/*
  Warnings:

  - Added the required column `clientId` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enterpriseId` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enterprise_id` to the `order_product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "enterpriseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "order_product" ADD COLUMN     "enterprise_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "order_product" ADD CONSTRAINT "order_product_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
