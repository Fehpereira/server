/*
  Warnings:

  - Made the column `client_id` on table `order_product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "order_product" DROP CONSTRAINT "order_product_client_id_fkey";

-- AlterTable
ALTER TABLE "order_product" ALTER COLUMN "client_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "order_product" ADD CONSTRAINT "order_product_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
