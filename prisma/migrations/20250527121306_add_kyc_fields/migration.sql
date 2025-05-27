-- AlterTable
ALTER TABLE "reporter" ADD COLUMN     "kyc_data" JSONB,
ADD COLUMN     "kyc_verification" BOOLEAN NOT NULL DEFAULT false;
