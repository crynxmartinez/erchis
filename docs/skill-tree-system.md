# Skill Tree System

## 1. Core Concept

The Skill Tree is a **fractal evolution system** where:

- **Skills are universal** - Not locked to weapon categories
- **Weapons modify skills** - Base damage %, passive bonuses, AoE override
- **All skills are pre-built** in the database by admins
- When a player evolves a skill, they **choose from existing database skills**

### Key Principles:
- ~80 universal starter skills (Stage 0)
- Each skill can evolve through 5 stages
- Evolution spawns 5 children: **1 Upgrade + 4 Random** (from 9 variant types)
- Player chooses **2 of 5** children to learn
- **Upgrade replaces parent** (no skill count increase)
- **Other variants add new skills** (+1 to learned count, max 100)

---

## 2. Stages & Use Requirements

Each skill progresses through stages based on how many times **that specific skill** is used by the player.

| Stage | Uses Required | Cumulative |
|-------|---------------|------------|
| Stage 0 → Stage 1 | 100 uses | 100 |
| Stage 1 → Stage 2 | 300 uses | 400 |
| Stage 2 → Stage 3 | 500 uses | 900 |
| Stage 3 → Stage 4 | 900 uses | 1,800 |
| Stage 4 → Stage 5 | 1,500 uses | 3,300 |

> **Important:** useCount is **per player per skill**.

---

## 3. Evolution Flow

### When Player Reaches Threshold:
1. Combat ends → Modal popup appears
2. Shows 5 pre-built children from database
3. Player picks 2 to learn (can dismiss and choose later in safe zone)
4. 3 unchosen skills are **gone forever** for that player

### What Happens with Choices:
- **Pick Upgrade** → Replaces parent skill (same slot, stronger stats)
- **Pick Other Variant** → Adds new skill to learned list (+1 count)

### Skill Limit:
- Max **100 learned skills** per player
- Upgrades don't count (they replace)
- Forces strategic choices

---

## 4. Variant Types (10 Total)

| # | Variant | Description | Icon |
|---|---------|-------------|------|
| 1 | **Upgrade** | Direct upgrade, replaces parent | ⬆️ |
| 2 | **Original Variant** | Similar but different execution | 🔄 |
| 3 | **Buff Variant** | Adds self-buff effect | 💪 |
| 4 | **Debuff Variant** | Adds enemy debuff effect | 💀 |
| 5 | **Unique** | Completely different skill | ✨ |
| 6 | **AoE Variant** | Converts to area effect | 💥 |
| 7 | **Combo Variant** | Multi-hit chains | ⛓️ |
| 8 | **Counter Variant** | Reactive/defensive trigger | 🛡️ |
| 9 | **Mobility Variant** | Adds movement | 💨 |
| 10 | **Sustain Variant** | Adds lifesteal/heal | ❤️‍🩹 |

### Generation Rule:
- **1 Upgrade** (always included)
- **4 Random** (shuffled from the other 9 variants)
- **Total: 5 children** shown to player

---

## 5. Skill Scale

Starting from ~80 starter skills:

| Stage | Skills per Starter | Total (80 starters) |
|-------|-------------------|---------------------|
| Stage 0 | 1 | 80 |
| Stage 1 | 5 | 400 |
| Stage 2 | 25 | 2,000 |
| Stage 3 | 125 | 10,000 |
| Stage 4 | 625 | 50,000 |
| Stage 5 | 3,125 | 250,000 |

All skills are **pre-built in database** using the Skill Database Builder.

---

## 6. Damage System

### Damage Formula:
```
Damage = WeaponBase × SkillAmp
```

### With Crit (Physical only):
```
Damage = WeaponBase × SkillAmp × CritMultiplier
```

### Physical vs Magic:
| Type | Can Crit? | Amp Range (Stage 0) | Max Amp (Stage 5) |
|------|-----------|---------------------|-------------------|
| Physical | Yes | 50-100% | ~125% |
| Magic | No | 100-150% | **200%** |
| None | No | 0% | 0% |

**Note:** Stats are for requirements only, NOT damage calculation.

### Skill Amp Tiers (Stage 0):
| Tier | Physical Amp | Magic Amp | Use Case |
|------|--------------|-----------|----------|
| **Weak** | 50-60% | 100-110% | Fast/utility, multi-hit |
| **Normal** | 65-80% | 115-130% | Standard attacks |
| **Strong** | 85-95% | 135-145% | Heavy/slow skills |
| **Power** | 100% | 150% | Finishers, high cost |

**Note:** Stats (STR/DEX/INT) are for **Weapon/Skill Requirements ONLY**. They do NOT scale damage directly.

---

## 7. Weapon Modifiers

Weapons provide:
1. **Base Damage %** - Multiplier on skill amp
2. **Passive Bonus** - Always active when equipped
3. **AoE Override** - 2H weapons force skills to hit multiple targets

### 2H Weapons (AoE Override):
| Weapon | Base Dmg | AoE Type |
|--------|----------|----------|
| Greatsword | 120% | Cone (3 targets) |
| Greataxe | 140% | Cone (3 targets) |
| Greathammer | 130% | Circle AoE (2 tiles) |
| Staff | 90% | +20% AoE Size |

### Dual-Wield:
- Stack passives from both weapons
- Example: Sword + Dagger = +10% Parry + 15% Crit

---

## 8. Skill Object Structure

```typescript
interface Skill {
  // Identity
  id: string
  name: string
  description: string
  skillType: string           // "Attack", "Defensive", "Buff", etc.
  damageType: string          // "physical" | "magic"
  
  // Tree Structure
  stage: number               // 0-5
  parentId: string | null
  starterSkillName: string    // Root skill for tree tracking
  variantType: string         // upgrade, buff_variant, etc.
  
  // Combat Stats
  ampPercent: number          // 50-200% multiplier
  apCost: number              // 3-10 AP
  cooldown: number            // 1-5 turns
  
  // Targeting
  targetType: string          // single, self, aoe_cone, aoe_circle
  range: number               // 1 = melee, 2+ = ranged
  hitCount: number            // 1-4 hits
  
  // Effects (optional)
  buffType?: string
  buffDuration?: number
  debuffType?: string
  debuffDuration?: number
  debuffChance?: number
  lifestealPercent?: number
  armorPierce?: number
  bonusVsGuard?: number
  bonusVsDebuffed?: number
  
  // Flags
  isCounter: boolean
  triggerCondition?: string
  
  // Admin
  isSaved: boolean
}
```

---

## 9. Player Skill Tracking

```typescript
interface PlayerSkill {
  id: string
  playerId: string
  skillId: string
  
  useCount: number            // Times used
  isEquipped: boolean         // On skill bar?
  slotPosition?: number       // Which slot (1-20)
  
  learnedAt: DateTime
}
```

### Skill Bar:
- Base: 10 slots
- +1 slot per 10 levels
- Max: 20 slots at level 100

---

## 10. Evolution Example

### Player Journey:
1. Learn **Slash** from Trainer (Stage 0, free)
2. Use Slash 100 times in combat
3. Combat ends → Modal: "Slash ready to evolve!"
4. Shows 5 children:
   - ⬆️ Power Slash (upgrade)
   - 💥 Sweeping Slash (AoE)
   - 💀 Bleeding Slash (debuff)
   - ⛓️ Double Slash (combo)
   - 💨 Dash Slash (mobility)
5. Player picks **Power Slash** + **Bleeding Slash**
6. Result:
   - Slash → replaced by Power Slash
   - Bleeding Slash → added to learned skills
7. Now use Power Slash 300 times → next evolution

---

## 11. Admin: Skill Database Builder

### Purpose:
Pre-build ALL skills in database before players use them.

### Flow:
1. Create ~80 starter skills (Stage 0)
2. Generate 5 children for each
3. Review/edit generated skills
4. Save approved skills
5. Repeat for each child until Stage 5

### Location:
`/admin/skills`
