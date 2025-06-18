/*
  Warnings:

  - You are about to drop the column `isActive` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentId` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `isBarber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `schedule` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `specialties` on the `users` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `tips` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `categoryId` on table `services` required. This step will fail if there are existing NULL values in that column.
*/

-- Clean up duplicate NULL emails in barbers table
UPDATE "barbers" SET email = id || '@temp.com' WHERE email IS NULL;

-- Clean up duplicate NULL emails in clients table
UPDATE "clients" SET email = id || '@temp.com' WHERE email IS NULL;

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "tips" DROP CONSTRAINT "tips_saleId_fkey";

-- DropIndex
DROP INDEX "categories_name_key";

-- DropIndex
DROP INDEX "sales_appointmentId_key";

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "date" TYPE TIMESTAMP(3) USING to_timestamp(date, 'YYYY-MM-DD');

-- AlterTable
ALTER TABLE "barbers" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "isActive",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "appointmentId",
DROP COLUMN "paymentMethod",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'completed';

-- AlterTable
ALTER TABLE "service_logs" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "image",
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "duration" SET DEFAULT 30,
ALTER COLUMN "categoryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isBarber",
DROP COLUMN "phone",
DROP COLUMN "rating",
DROP COLUMN "schedule",
DROP COLUMN "specialties",
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'CLIENT',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "tips";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "UserRole";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateIndex
CREATE INDEX "appointments_clientId_idx" ON "appointments"("clientId");

-- CreateIndex
CREATE INDEX "appointments_serviceId_idx" ON "appointments"("serviceId");

-- CreateIndex
CREATE INDEX "appointments_barberId_idx" ON "appointments"("barberId");

-- CreateIndex
CREATE UNIQUE INDEX "barbers_email_key" ON "barbers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE INDEX "sales_clientId_idx" ON "sales"("clientId");

-- CreateIndex
CREATE INDEX "sales_serviceId_idx" ON "sales"("serviceId");

-- CreateIndex
CREATE INDEX "sales_barberId_idx" ON "sales"("barberId");

-- CreateIndex
CREATE INDEX "service_logs_clientId_idx" ON "service_logs"("clientId");

-- CreateIndex
CREATE INDEX "service_logs_serviceId_idx" ON "service_logs"("serviceId");

-- CreateIndex
CREATE INDEX "service_logs_barberId_idx" ON "service_logs"("barberId");

-- CreateIndex
CREATE INDEX "services_categoryId_idx" ON "services"("categoryId");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
