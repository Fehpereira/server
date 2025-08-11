-- AlterTable
ALTER TABLE "order_product" ADD COLUMN     "client_id" TEXT;

-- AddForeignKey
ALTER TABLE "order_product" ADD CONSTRAINT "order_product_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
