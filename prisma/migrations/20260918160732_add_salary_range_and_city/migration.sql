/*
  Warnings:

  - Made the column `source` on table `job_applications` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN     "city" TEXT,
ADD COLUMN     "salaryRange" TEXT,
ALTER COLUMN "source" SET NOT NULL;
