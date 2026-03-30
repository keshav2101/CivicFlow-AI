/*
  Warnings:

  - You are about to drop the column `negotiationHistory` on the `Clause` table. All the data in the column will be lost.
  - You are about to drop the column `partyId` on the `Clause` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Clause` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Clause" DROP COLUMN "negotiationHistory",
DROP COLUMN "partyId",
DROP COLUMN "status",
ADD COLUMN     "statusPartyA" "ClauseStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "statusPartyB" "ClauseStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "explanation" JSONB;

-- CreateTable
CREATE TABLE "ClauseRevision" (
    "id" TEXT NOT NULL,
    "clauseId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "reason" TEXT,
    "explanation" JSONB,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClauseRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricsSnapshot" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "routingAccuracy" DOUBLE PRECISION NOT NULL,
    "avgApprovalTimeMinutes" DOUBLE PRECISION NOT NULL,
    "slaComplianceRate" DOUBLE PRECISION NOT NULL,
    "clauseResolutionRate" DOUBLE PRECISION NOT NULL,
    "manualInterventionRate" DOUBLE PRECISION NOT NULL,
    "queueProcessingLatencyMs" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MetricsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "ruleBefore" JSONB,
    "ruleAfter" JSONB,
    "reasonForChange" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClauseRevision" ADD CONSTRAINT "ClauseRevision_clauseId_fkey" FOREIGN KEY ("clauseId") REFERENCES "Clause"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClauseRevision" ADD CONSTRAINT "ClauseRevision_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricsSnapshot" ADD CONSTRAINT "MetricsSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
