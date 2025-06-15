-- Drop existing constraints if they exist
DO $$ BEGIN
    ALTER TABLE IF EXISTS "service_logs" DROP CONSTRAINT IF EXISTS "service_logs_barberId_fkey";
    ALTER TABLE IF EXISTS "service_logs" DROP CONSTRAINT IF EXISTS "service_logs_serviceId_fkey";
    ALTER TABLE IF EXISTS "service_logs" DROP CONSTRAINT IF EXISTS "service_logs_clientId_fkey";
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Drop table if exists and create it
DROP TABLE IF EXISTS "service_logs";

-- CreateTable
CREATE TABLE "service_logs" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "barbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 