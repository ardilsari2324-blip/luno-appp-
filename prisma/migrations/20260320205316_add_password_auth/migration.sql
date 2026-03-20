-- AlterTable
ALTER TABLE "OtpVerification" ADD COLUMN "passwordHash" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
