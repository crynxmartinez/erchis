# Skill System V2 - Complete Reference

## Overview

This document contains the complete skill system design for the turn-based game.

---

## 1. Universal Skills

Skills are **not locked to weapon categories**. Any player can learn any skill.

### Starter Skills (100 total in 9 categories)

| Category | Count | Weapon Req | Examples |
|----------|-------|------------|----------|
| Melee Attacks | 15 | melee_only | Slash, Thrust, Smash, Cleave, Chop |
| Ranged Attacks | 15 | ranged_only | Shot, Volley, Snipe, Burst Fire |
| Magic Attacks | 15 | magic_only* | Fireball, Ice Spike, Lightning Bolt |
| Defensive | 10 | any | Guard, Parry, Block, Brace |
| Buffs | 8 | any | Empower, Haste, Fortify, Focus |
| Debuffs | 8 | any | Slow, Weaken, Blind, Armor Break |
| Movement | 10 | any | Dash, Sprint, Jump, Roll, Sidestep |
| Utility/Awareness | 10 | any | Detect, Inspect, Feint, Track |
| Support | 9 | any | Meditate, Heal, Stabilize, Rally |

*Magic skills have **Utility Mode**: When used with non-magic weapons, they become weapon enchants instead of direct damage.

### Weapon Requirements:
- **melee_only**: Requires Sword, Greatsword, Katana, Dagger, Axe, Greataxe, Mace, Greathammer, Spear, Fist, **Shield**
- **ranged_only**: Requires Bow, Crossbow, Gun
- **magic_only**: Requires Staff, Wand, Tome (or becomes enchant with other weapons)
- **any**: Can be used with any weapon or no weapon

### Magic Utility Mode:
When a magic skill is used with a non-magic weapon, it becomes a weapon enchant:

| Skill | Direct Effect (Magic Weapon) | Utility Effect (Other Weapons) |
|-------|------------------------------|-------------------------------|
| Fireball | Fire damage | Fire enchant (burn on hit) |
| Ice Spike | Ice damage | Frost enchant (slow on hit) |
| Lightning Bolt | Lightning damage | Shock enchant (stun chance) |
| Shadow Strike | Dark damage | Shadow enchant (lifesteal) |
| Holy Smite | Holy damage | Holy enchant (bonus vs undead) |

### Learning Skills:
- **Starter skills** are free from Skill Trainer NPC
- **Evolved skills** are chosen during evolution (2 of 5)
- **Max 100 learned skills** per player (cannot unlearn)

---

## 2. Damage Types & Balance

| Type | Can Crit? | Amp Range (Stage 0) | Max Amp (Stage 5) | Notes |
|------|-----------|---------------------|-------------------|-------|
| **Physical** | Yes | 50-100% | ~125% | Lower amp, compensated by crit multiplier (1.5x+) |
| **Magic** | No | 100-150% | **200%** | Higher consistent amp, no crit variance |
| **None** | No | 0% | 0% | Utility, Buffs, Movement, etc. |

### Balance Philosophy:
- **Physical** relies on Weapon Base + Crit for high burst ceilings.
- **Magic** relies on high base Skill Amp (up to 200%) for reliable, consistent output.
- **Stats (STR/DEX/INT)** are used for **Weapon/Skill Requirements ONLY**. They do NOT scale damage directly.

---

## 3. Damage Formula

```
Damage = WeaponBase × SkillAmp
```

### With Crit (Physical only):
```
Damage = WeaponBase × SkillAmp × CritMultiplier
```

### Components:
- **WeaponBase**: 40-140% (Depends on weapon category)
- **SkillAmp**: 50-200% (Physical: 50-125%, Magic: 100-200%)
- **CritMultiplier**: 1.5x base (Can be increased by items/passives)

### Dual Wielding Rules:
- **Main Hand:** Determines the **Base Damage** for skills.
- **Off Hand:** Acts as a **Stat Stick**. You gain its Stats and Passive Bonus, but it does NOT attack separately or add its base damage to the skill.
- **Example:** Sword (Main) + Dagger (Off).
  - You get Sword's Base Damage (80%).
  - You get Dagger's Passive (+15% Crit).
  - You get Dagger's Stats (DEX).

---

## 4. Weapon Base Damage Table

| Category | Type | Base Dmg | Passive Bonus |
|----------|------|----------|---------------|
| **Greataxe** | Melee (2H) | 140% | +20% vs Low HP |
| **Greathammer** | Melee (2H) | 130% | +20% Stun Chance |
| **Greatsword** | Melee (2H) | 120% | +25% Stagger |
| **Crossbow** | Ranged (2H) | 100% | +25% Armor Pen |
| **Staff** | Magic (2H) | 90% | +20% AoE Size |
| **Axe** | Melee (1H) | 85% | +15% vs Guard |
| **Bow** | Ranged (2H) | 85% | +2 Range |
| **Sword** | Melee (1H) | 80% | +10% Parry |
| **Mace** | Melee (1H) | 80% | +15% Armor Pen |
| **Gun** | Ranged (1H) | 75% | +10% Crit Damage |
| **Katana** | Versatile | 75%/95% | +10%/20% Counter |
| **Spear** | Versatile | 75%/90% | +1 Range |
| **Wand** | Magic (1H) | 70% | -1 Cooldown (Magic) |
| **Tome** | Magic (1H) | 65% | +30% Buff Duration |
| **Dagger** | Melee (1H) | 60% | +15% Crit Chance |
| **Shield** | Defense | **60%** | +30% Block Chance |
| **Fist** | Melee (1H) | 50% | +1 Hit Count |

---

## 5. Skill Amp Tiers (Stage 0)

### Physical Skills (50-100%)
| Tier | Amp % | AP | CD | Use Case |
|------|-------|----|----|----------|
| **Weak/Fast** | 50-60% | 2-3 | 1 | Multi-hit, speed, utility |
| **Normal** | 65-80% | 4-5 | 1-2 | Standard bread-and-butter attacks |
| **Heavy** | 85-95% | 5-6 | 2-3 | Hard hitting, setup required |
| **Finisher** | 100% | 6+ | 3+ | Ultimate moves |

### Magic Skills (100-150%)
| Tier | Amp % | AP | CD | Use Case |
|------|-------|----|----|----------|
| **Basic** | 100-110% | 3-4 | 1 | Basic spells, cantrips |
| **Strong** | 115-130% | 4-5 | 2 | Main damage spells |
| **Power** | 135-150% | 6+ | 3+ | Big nukes, AoE bursts |

---

## 6. Stage Scaling

Skills grow stronger as they evolve. Scaling is **additive** to the Base Amp.

| Stage | Amp Bonus | AP Cost | Cooldown |
|-------|-----------|---------|----------|
| **0** | +0% | +0 | +0 |
| **1** | +5% | +0 | +0 |
| **2** | +10% | +1 | +0 |
| **3** | +15% | +1 | +1 |
| **4** | +20% | +2 | +1 |
| **5** | +25% | +2 | +1 |

*Example:*
> **Slash (Stage 0):** 60% Amp
>
> **Slash III (Stage 3):** 60% Base + 15% Stage Bonus = **75% Amp**

---

When generating child skills, apply these modifiers:

| Variant | Amp Mod | AP Mod | CD Mod | Special |
|---------|---------|--------|--------|---------|
| ⬆️ Upgrade | +10% | +0 | +0 | Pure stat boost |
| 🔄 Original | +0% | +0 | +0 | Different execution |
| 💪 Buff | -10% | +1 | +0 | Adds buff effect |
| 💀 Debuff | -10% | +1 | +0 | Adds debuff effect |
| ✨ Unique | ±15% | ±2 | ±1 | Wildcard |
| 💥 AoE | -15% | +2 | +1 | Hits multiple |
| ⛓️ Combo | -20% per hit | +1 | +0 | Multi-hit (2-4x) |
| 🛡️ Counter | +15% | +0 | +1 | Requires trigger |
| 💨 Mobility | -10% | +1 | +0 | Adds movement |
| ❤️‍🩹 Sustain | -15% | +1 | +1 | Adds recovery |

---

## 6. Buff Types

| Buff | Effect | Base Duration |
|------|--------|---------------|
| **Haste** | -20% Cooldowns | 3 turns |
| **Empower** | +15% Damage | 3 turns |
| **Fortify** | +15% Defense | 3 turns |
| **Focus** | +10% Crit Chance | 3 turns |
| **Regen** | +3% HP per turn | 3 turns |

### Duration Scaling:
```
Duration = 3 + (stage × 0.5) turns (round up)
```

---

## 7. Debuff Types

| Debuff | Effect | Base Duration |
|--------|--------|---------------|
| **Slow** | +1 AP cost to actions | 2 turns |
| **Bleed** | 5% max HP per turn | 2 turns |
| **Armor Break** | -15% Defense | 2 turns |
| **Weaken** | -10% Damage | 2 turns |
| **Blind** | -20% Accuracy | 2 turns |
| **Stun** | Skip next turn | 1 turn |

### Duration Scaling:
```
Duration = 2 + (stage × 0.5) turns (round up)
```

---

## 8. Target Types

| Type | Description | Weapon Override |
|------|-------------|-----------------|
| **single** | One target | - |
| **self** | Caster only | - |
| **aoe_cone** | 90° arc, 3 targets | Greatsword, Greataxe |
| **aoe_circle** | Around caster, 2 tile radius | Greathammer |
| **aoe_line** | Straight line, 2 targets | Spear (2H mode) |
| **all_enemies** | All enemies | Staff (+20% size) |

### 2H Weapon AoE Override:
When using a 2H weapon, single-target skills become AoE based on weapon type.

---

## 9. Skill Database Schema

```prisma
model Skill {
  id                String   @id @default(cuid())
  name              String
  description       String
  
  // Type
  skillType         String   // Attack, Defensive, Buff, Debuff, Utility
  damageType        String   // physical, magic, none
  
  // Tree
  stage             Int      @default(0)
  parentId          String?
  parent            Skill?   @relation("SkillTree", fields: [parentId], references: [id])
  children          Skill[]  @relation("SkillTree")
  starterSkillName  String
  variantType       String   @default("root")
  
  // Combat
  ampPercent        Int      @default(100)
  apCost            Int      @default(5)
  cooldown          Int      @default(1)
  
  // Targeting
  targetType        String   @default("single")
  range             Int      @default(1)
  hitCount          Int      @default(1)
  
  // Effects
  buffType          String?
  buffDuration      Int?
  debuffType        String?
  debuffDuration    Int?
  debuffChance      Int?     @default(100)
  lifestealPercent  Int?
  armorPierce       Int?
  bonusVsGuard      Int?
  bonusVsDebuffed   Int?
  
  // Flags
  isCounter         Boolean  @default(false)
  triggerCondition  String?
  
  // Admin
  isSaved           Boolean  @default(false)
  
  // Relations
  playerSkills      PlayerSkill[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model PlayerSkill {
  id            String   @id @default(cuid())
  playerId      String
  player        Player   @relation(fields: [playerId], references: [id])
  skillId       String
  skill         Skill    @relation(fields: [skillId], references: [id])
  
  useCount      Int      @default(0)
  isEquipped    Boolean  @default(false)
  slotPosition  Int?
  
  learnedAt     DateTime @default(now())
  
  @@unique([playerId, skillId])
}
```

---

## 10. Weapon Category Stats

### 1H Weapons (Can Dual-Wield)

| Category | Base Dmg | Passive | Stat |
|----------|----------|---------|------|
| Dagger | 60% | +15% Crit Chance | DEX |
| Sword | 80% | +10% Parry Window | STR |
| Axe | 85% | +15% vs Guard | STR |
| Mace | 80% | +15% Armor Pen | STR |
| Fist | 50% | +1 Hit Count | STR |
| Gun | 75% | +10% Crit Damage | DEX |
| Wand | 70% | -1 CD (magic) | INT |
| Tome | 65% | +30% Buff Duration | INT |
| Shield | 40% | +30% Block Chance | VIT |

### 2H Weapons (AoE Override)

| Category | Base Dmg | Passive | AoE Type | Stat |
|----------|----------|---------|----------|------|
| Greatsword | 120% | +25% Stagger | Cone (3) | STR |
| Greataxe | 140% | +20% vs Low HP | Cone (3) | STR |
| Greathammer | 130% | +20% Stun Chance | Circle (2) | STR |
| Bow | 85% | +2 Range | - | DEX |
| Crossbow | 100% | +25% Armor Pen | - | DEX |
| Staff | 90% | +20% AoE Size | - | INT |

### Versatile (Toggle 1H/2H)

| Category | 1H Mode | 2H Mode | Stat |
|----------|---------|---------|------|
| Katana | 75%, +10% Crit Dmg | 95%, +20% Counter | STR/DEX |
| Spear | 75%, +1 Range | 90%, Line AoE (2) | STR/DEX |

---

## 11. Stage Scaling

As skills evolve, their stats scale:

| Stage | Amp Bonus | AP Increase | CD Increase |
|-------|-----------|-------------|-------------|
| 0 | +0% | +0 | +0 |
| 1 | +5% | +0 | +0 |
| 2 | +10% | +1 | +0 |
| 3 | +15% | +1 | +1 |
| 4 | +20% | +2 | +1 |
| 5 | +25% | +2 | +1 |

---

## 12. Example Skills

### Slash (Stage 0, Starter)
- **Type:** Attack (Physical)
- **Amp:** 60%
- **AP:** 3
- **CD:** 1 turn
- **Target:** Single
- **Description:** A basic horizontal cut.

### Power Slash (Stage 1, Upgrade)
- **Type:** Attack (Physical)
- **Amp:** 65% (60% Base + 5% Stage)
- **AP:** 3
- **CD:** 1 turn
- **Target:** Single
- **Description:** A stronger horizontal cut with more force.

### Bleeding Slash (Stage 1, Debuff Variant)
- **Type:** Attack (Physical)
- **Amp:** 55% (60% Base + 5% Stage - 10% Variant)
- **AP:** 4
- **CD:** 1 turn
- **Target:** Single
- **Debuff:** Bleed (5% HP/turn, 2 turns)
- **Description:** A cut that leaves a bleeding wound.

### Sweeping Slash (Stage 1, AoE Variant)
- **Type:** Attack (Physical)
- **Amp:** 50% (60% Base + 5% Stage - 15% Variant)
- **AP:** 5
- **CD:** 2 turns
- **Target:** AoE Cone (3)
- **Description:** A wide arc that hits multiple enemies.

---

## 13. Skill Generation Rules

### For Child Skills:
1. Start with parent's base stats
2. Apply variant modifier (amp, AP, CD)
3. Apply stage bonus
4. Add variant-specific effects (buff, debuff, etc.)
5. Generate unique name based on variant type
6. Generate description based on effects

### Name Generation:
- **Upgrade:** Add "II", "III", or power words
- **AoE:** Add "Sweeping", "Wide", "Arc"
- **Combo:** Add "Double", "Triple", "Chain"
- **Debuff:** Add effect name ("Bleeding", "Weakening")
- **Buff:** Add buff name ("Empowering", "Focused")
- **Mobility:** Add "Dash", "Step", "Flash"
- **Counter:** Add "Counter", "Retaliation", "Riposte"
- **Sustain:** Add "Draining", "Vampiric", "Life"

---

## 14. Combat Flow

1. Player selects skill from skill bar
2. Check AP cost (can afford?)
3. Check cooldown (ready?)
4. Select target(s)
5. Calculate damage:
   - Get weapon base damage
   - Multiply by skill amp
   - Check for crit (physical only)
   - Apply weapon passive bonuses
   - Apply 2H AoE override if applicable
6. Apply damage to target(s)
7. Apply effects (buffs, debuffs)
8. Increment useCount for player
9. Check for evolution threshold
10. Start cooldown

---

## 15. Evolution Check

After each skill use:
```typescript
const THRESHOLDS = { 1: 100, 2: 300, 3: 500, 4: 900, 5: 1500 }

function checkEvolution(playerSkill: PlayerSkill): boolean {
  const nextStage = playerSkill.skill.stage + 1
  if (nextStage > 5) return false
  return playerSkill.useCount >= THRESHOLDS[nextStage]
}
```

If evolution ready:
- Flag skill for evolution
- After combat ends, show evolution modal
- Player can dismiss and choose later in safe zone
