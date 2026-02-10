-- AlterTable
ALTER TABLE "Competition" ADD COLUMN "createdBy" TEXT;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
