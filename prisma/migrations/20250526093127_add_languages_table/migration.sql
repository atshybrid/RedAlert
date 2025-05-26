/*
  Warnings:

  - You are about to drop the column `language` on the `article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "article" DROP COLUMN "language",
ADD COLUMN     "languageCode" VARCHAR(10);

-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "languages"("code") ON DELETE SET NULL ON UPDATE CASCADE;
