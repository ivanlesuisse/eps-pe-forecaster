BEGIN;
SET LOCAL search_path = "fintrack";
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "monthlyExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "monthlyIncome" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "annualFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fxRate" DOUBLE PRECISION,
ADD COLUMN     "monthlyIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlySaving" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WealthSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "gross" DOUBLE PRECISION NOT NULL,
    "debt" DOUBLE PRECISION NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "WealthSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Goal_userId_idx" ON "Goal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WealthSnapshot_userId_day_key" ON "WealthSnapshot"("userId", "day");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WealthSnapshot" ADD CONSTRAINT "WealthSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


CREATE INDEX "Asset_userId_idx" ON "Asset"("userId");
COMMIT;
