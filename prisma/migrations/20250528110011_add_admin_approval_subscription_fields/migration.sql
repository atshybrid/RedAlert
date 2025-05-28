-- AlterTable
ALTER TABLE "reporter" ADD COLUMN     "isApprovedByAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscribed" BOOLEAN NOT NULL DEFAULT false;
