-- AlterTable
ALTER TABLE "deployments" ADD COLUMN "createdById" TEXT;

-- CreateIndex
CREATE INDEX "deployments_createdById_idx" ON "deployments"("createdById");

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
