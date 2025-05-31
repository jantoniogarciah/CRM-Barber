/*
  Warnings:

  - You are about to drop the column `name` on the `Barber` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Client` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Barber` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Barber` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Barber` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Barber" DROP COLUMN "name",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "name",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastName" TEXT NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;
