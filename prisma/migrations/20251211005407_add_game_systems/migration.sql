/*
  Warnings:

  - You are about to drop the column `currentArea` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `currentFloor` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "currentArea",
DROP COLUMN "currentFloor",
ADD COLUMN     "characterImage" TEXT,
ADD COLUMN     "currentLocationId" TEXT,
ADD COLUMN     "isInSafeZone" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "learnedSkillCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "raceId" TEXT;

-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "passive1Name" TEXT NOT NULL,
    "passive1Type" TEXT NOT NULL,
    "passive1Value" DOUBLE PRECISION NOT NULL,
    "passive2Name" TEXT NOT NULL,
    "passive2Type" TEXT NOT NULL,
    "passive2Value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeaponCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryStat" TEXT NOT NULL,
    "secondaryStat" TEXT,
    "isRanged" BOOLEAN NOT NULL DEFAULT false,
    "isTwoHanded" BOOLEAN NOT NULL DEFAULT false,
    "isMagic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeaponCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weapon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'Common',
    "baseDamage" INTEGER NOT NULL,
    "attackSpeed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "critBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "range" INTEGER NOT NULL DEFAULT 1,
    "levelRequired" INTEGER NOT NULL DEFAULT 1,
    "strRequired" INTEGER NOT NULL DEFAULT 0,
    "agiRequired" INTEGER NOT NULL DEFAULT 0,
    "vitRequired" INTEGER NOT NULL DEFAULT 0,
    "intRequired" INTEGER NOT NULL DEFAULT 0,
    "dexRequired" INTEGER NOT NULL DEFAULT 0,
    "lukRequired" INTEGER NOT NULL DEFAULT 0,
    "weight" INTEGER NOT NULL,
    "maxDurability" INTEGER NOT NULL DEFAULT 100,
    "buyPrice" INTEGER NOT NULL DEFAULT 0,
    "sellPrice" INTEGER NOT NULL DEFAULT 0,
    "isBasic" BOOLEAN NOT NULL DEFAULT false,
    "isTradeable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Weapon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT,
    "skillType" TEXT NOT NULL,
    "baseDamage" INTEGER NOT NULL DEFAULT 0,
    "damageScaling" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scalingStat" TEXT,
    "cooldown" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "apCost" INTEGER NOT NULL DEFAULT 0,
    "range" INTEGER NOT NULL DEFAULT 1,
    "isAoE" BOOLEAN NOT NULL DEFAULT false,
    "aoeRadius" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "effectType" TEXT,
    "effectChance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "effectDuration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "effectValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "levelRequired" INTEGER NOT NULL DEFAULT 1,
    "prerequisiteSkillId" TEXT,
    "isBasic" BOOLEAN NOT NULL DEFAULT true,
    "isPassive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSkill" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "learnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSkillBar" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "slotPosition" INTEGER NOT NULL,
    "playerSkillId" TEXT NOT NULL,

    CONSTRAINT "PlayerSkillBar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerInventory" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "weaponId" TEXT NOT NULL,
    "currentDurability" INTEGER NOT NULL,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "equipSlot" TEXT,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "floor" INTEGER NOT NULL DEFAULT 1,
    "isSafeZone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Race_name_key" ON "Race"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WeaponCategory_name_key" ON "WeaponCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSkill_playerId_skillId_key" ON "PlayerSkill"("playerId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSkillBar_playerId_slotPosition_key" ON "PlayerSkillBar"("playerId", "slotPosition");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weapon" ADD CONSTRAINT "Weapon_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "WeaponCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "WeaponCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSkill" ADD CONSTRAINT "PlayerSkill_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSkill" ADD CONSTRAINT "PlayerSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSkillBar" ADD CONSTRAINT "PlayerSkillBar_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSkillBar" ADD CONSTRAINT "PlayerSkillBar_playerSkillId_fkey" FOREIGN KEY ("playerSkillId") REFERENCES "PlayerSkill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerInventory" ADD CONSTRAINT "PlayerInventory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerInventory" ADD CONSTRAINT "PlayerInventory_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "Weapon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
