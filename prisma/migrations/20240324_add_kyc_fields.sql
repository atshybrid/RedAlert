-- Add KYC fields to reporter table
ALTER TABLE "reporter" ADD COLUMN "kyc_verification" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reporter" ADD COLUMN "kyc_data" JSONB; 