-- CreateEnum
CREATE TYPE "TrainingCategory" AS ENUM ('INTRODUCTORY', 'NICHE_TOPICS', 'TOOL_BASED', 'CODE_ALONG', 'APPS', 'UTILITIES', 'SAAS_SCAFFOLDING');

-- CreateEnum
CREATE TYPE "TrainingLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TrainingCategory" NOT NULL,
    "level" "TrainingLevel" NOT NULL,
    "externalLink" TEXT NOT NULL,
    "duration" INTEGER,
    "price" DECIMAL(10,2),
    "image" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trainings_isActive_idx" ON "trainings"("isActive");

-- CreateIndex
CREATE INDEX "trainings_featured_isActive_idx" ON "trainings"("featured", "isActive");

-- CreateIndex
CREATE INDEX "trainings_category_idx" ON "trainings"("category");

-- CreateIndex
CREATE INDEX "trainings_displayOrder_idx" ON "trainings"("displayOrder");
