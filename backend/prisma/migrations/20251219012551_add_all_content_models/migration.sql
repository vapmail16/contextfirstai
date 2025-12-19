-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('LIVE', 'BETA', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "KnowledgeCategory" AS ENUM ('GLOSSARY', 'CORE_CONCEPTS', 'BEST_PRACTICES', 'CASE_STUDIES', 'SAAS_SCAFFOLDING');

-- CreateEnum
CREATE TYPE "CommunityPlatform" AS ENUM ('SKOOL', 'SLACK', 'DISCORD', 'OTHER');

-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "problemSolved" TEXT NOT NULL,
    "whoShouldUse" TEXT,
    "externalLink" TEXT NOT NULL,
    "image" TEXT,
    "relatedTrainingIds" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "problemSolved" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL,
    "externalLink" TEXT NOT NULL,
    "pricing" TEXT,
    "image" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "KnowledgeCategory" NOT NULL,
    "readTime" INTEGER,
    "image" TEXT,
    "externalLink" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_links" (
    "id" TEXT NOT NULL,
    "platform" "CommunityPlatform" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "externalLink" TEXT NOT NULL,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tools_isActive_idx" ON "tools"("isActive");

-- CreateIndex
CREATE INDEX "tools_featured_isActive_idx" ON "tools"("featured", "isActive");

-- CreateIndex
CREATE INDEX "tools_displayOrder_idx" ON "tools"("displayOrder");

-- CreateIndex
CREATE INDEX "products_isActive_idx" ON "products"("isActive");

-- CreateIndex
CREATE INDEX "products_featured_isActive_idx" ON "products"("featured", "isActive");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_displayOrder_idx" ON "products"("displayOrder");

-- CreateIndex
CREATE INDEX "knowledge_articles_isActive_idx" ON "knowledge_articles"("isActive");

-- CreateIndex
CREATE INDEX "knowledge_articles_featured_isActive_idx" ON "knowledge_articles"("featured", "isActive");

-- CreateIndex
CREATE INDEX "knowledge_articles_category_idx" ON "knowledge_articles"("category");

-- CreateIndex
CREATE INDEX "knowledge_articles_displayOrder_idx" ON "knowledge_articles"("displayOrder");

-- CreateIndex
CREATE INDEX "community_links_isActive_idx" ON "community_links"("isActive");

-- CreateIndex
CREATE INDEX "community_links_platform_idx" ON "community_links"("platform");

-- CreateIndex
CREATE INDEX "community_links_displayOrder_idx" ON "community_links"("displayOrder");
