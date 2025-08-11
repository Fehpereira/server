-- AlterTable
ALTER TABLE "enterprises" ADD COLUMN     "isOpen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "openingHours" TEXT;
