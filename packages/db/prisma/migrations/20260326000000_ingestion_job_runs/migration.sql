-- CreateTable
CREATE TABLE "ingestion_job_runs" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "bullmqJobId" TEXT,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "errorSnippet" TEXT,
    "insertedCount" INTEGER,

    CONSTRAINT "ingestion_job_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ingestion_job_runs_jobType_startedAt_idx" ON "ingestion_job_runs"("jobType", "startedAt" DESC);
