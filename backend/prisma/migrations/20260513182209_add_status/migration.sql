-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'LOST');

-- AlterTable
ALTER TABLE "Key" ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "Kit" ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE';
