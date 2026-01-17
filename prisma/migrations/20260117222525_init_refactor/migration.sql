-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "userId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFLUENCER',
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "neighborhood" TEXT,
    "apartmentStyle" TEXT NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "personalityVibe" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'female',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "hairColor" TEXT NOT NULL DEFAULT 'brown',
    "hairStyle" TEXT NOT NULL DEFAULT 'long',
    "eyeColor" TEXT NOT NULL DEFAULT 'brown',
    "skinTone" TEXT NOT NULL DEFAULT 'medium',
    "lipStyle" TEXT NOT NULL DEFAULT 'natural',
    "facialHair" TEXT NOT NULL DEFAULT 'none',
    "features" TEXT[],
    "bodyHeight" TEXT NOT NULL DEFAULT 'average',
    "bodyType" TEXT NOT NULL DEFAULT 'slim',
    "clothingStyle" TEXT NOT NULL DEFAULT 'casual',
    "bottomwear" TEXT[],
    "footwear" TEXT[],
    "signatureItems" TEXT[],
    "faceReferences" TEXT[],
    "roomReferences" TEXT[],
    "lifecycleStartedAt" TIMESTAMP(3),
    "lifecycleStatus" TEXT NOT NULL DEFAULT 'new',
    "currentActivity" TEXT,
    "activityDetails" TEXT,
    "activityStartedAt" TIMESTAMP(3),
    "dailyOutfit" JSONB,
    "dailyOutfitDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contentUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "prompt" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvatarLibrary" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "gender" TEXT,
    "hairColor" TEXT,
    "hairStyle" TEXT,
    "eyeColor" TEXT,
    "skinTone" TEXT,
    "lipStyle" TEXT,
    "features" TEXT[],
    "bodyHeight" TEXT,
    "bodyType" TEXT,
    "usedBy" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvatarLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Persona_userId_idx" ON "Persona"("userId");

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
