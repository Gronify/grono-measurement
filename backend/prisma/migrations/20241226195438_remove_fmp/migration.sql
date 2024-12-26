/*
  Warnings:

  - You are about to drop the column `firstMeaningfulPaint` on the `Analyze` table. All the data in the column will be lost.
  - You are about to drop the column `weightFirstMeaningfulPaint` on the `Analyze` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analyze" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "firstContentfulPaint" REAL NOT NULL,
    "largestContentfulPaint" REAL NOT NULL,
    "speedIndex" REAL NOT NULL,
    "totalBlockingTime" REAL NOT NULL,
    "maxPotentialFid" REAL NOT NULL,
    "cumulativeLayoutShift" REAL NOT NULL,
    "serverResponseTime" REAL NOT NULL,
    "timeToInteractive" REAL NOT NULL,
    "metrics" REAL NOT NULL,
    "analyzeScore" REAL NOT NULL,
    "weightFirstContentfulPaint" REAL NOT NULL,
    "weightLargestContentfulPaint" REAL NOT NULL,
    "weightSpeedIndex" REAL NOT NULL,
    "weightTotalBlockingTime" REAL NOT NULL,
    "weightMaxPotentialFid" REAL NOT NULL,
    "weightCumulativeLayoutShift" REAL NOT NULL,
    "weightServerResponseTime" REAL NOT NULL,
    "weightTimeToInteractive" REAL NOT NULL,
    "weightMetrics" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Analyze" ("analyzeScore", "createdAt", "cumulativeLayoutShift", "firstContentfulPaint", "id", "largestContentfulPaint", "maxPotentialFid", "metrics", "serverResponseTime", "speedIndex", "timeToInteractive", "totalBlockingTime", "updatedAt", "url", "weightCumulativeLayoutShift", "weightFirstContentfulPaint", "weightLargestContentfulPaint", "weightMaxPotentialFid", "weightMetrics", "weightServerResponseTime", "weightSpeedIndex", "weightTimeToInteractive", "weightTotalBlockingTime") SELECT "analyzeScore", "createdAt", "cumulativeLayoutShift", "firstContentfulPaint", "id", "largestContentfulPaint", "maxPotentialFid", "metrics", "serverResponseTime", "speedIndex", "timeToInteractive", "totalBlockingTime", "updatedAt", "url", "weightCumulativeLayoutShift", "weightFirstContentfulPaint", "weightLargestContentfulPaint", "weightMaxPotentialFid", "weightMetrics", "weightServerResponseTime", "weightSpeedIndex", "weightTimeToInteractive", "weightTotalBlockingTime" FROM "Analyze";
DROP TABLE "Analyze";
ALTER TABLE "new_Analyze" RENAME TO "Analyze";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
