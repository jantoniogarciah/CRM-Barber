/*
  Warnings:

  - You are about to drop the column `email` on the `Barber` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Barber` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Barber` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Barber" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName";
