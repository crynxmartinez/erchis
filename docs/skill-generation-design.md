# Skill Generation System Design

## Overview
When a skill evolves to the next stage, it generates **5 child skills**:
- **1 Upgrade** (always constant)
- **4 Random** (from 9 other variants)

## 10 Variant Types

| # | Variant | Description | Icon | Color |
|---|---------|-------------|------|-------|
| 1 | **Upgrade** | Direct upgrade - same concept, stronger stats | ⬆️ | 🟢 Green |
| 2 | **Original Variant** | Similar but different execution | 🔄 | 🔵 Blue |
| 3 | **Buff Variant** | Adds self-buff effect | 💪 | 🟡 Yellow |
| 4 | **Debuff Variant** | Adds enemy debuff effect | 💀 | 🟣 Purple |
| 5 | **Unique** | Completely different skill | ✨ | 🟠 Orange |
| 6 | **AoE Variant** | Converts single-target to area effect | 💥 | 🔴 Red |
| 7 | **Combo Variant** | Chains into follow-up attacks | ⛓️ | 🩵 Cyan |
| 8 | **Counter Variant** | Reactive/defensive, triggers on enemy action | 🛡️ | ⚪ White |
| 9 | **Mobility Variant** | Adds movement (dash, teleport) | 💨 | 🩷 Pink |
| 10 | **Sustain Variant** | Adds lifesteal, heal, or recovery | ❤️‍🩹 | 🩶 Gray |

## Formulas

### Base Damage
```
Damage = 25% weapon damage + (2 × skill_stage)% all amp damage
```

| Stage | Damage |
|-------|--------|
| 0 | 25% |
| 1 | 27% |
| 2 | 29% |
| 3 | 31% |
| 4 | 33% |
| 5 | 35% |

### Buff Duration
```
Turns = 3 + (2 × skill_stage)
```

| Stage | Buff Turns |
|-------|------------|
| 0 | 3 |
| 1 | 5 |
| 2 | 7 |
| 3 | 9 |
| 4 | 11 |
| 5 | 13 |

### Lifesteal
```
Heal = 10% of total damage dealt (constant)
```

### Heal Skill
```
Heal = Same as damage formula (25% + 2×stage)% of max HP
```

### AP Cost
```
AP Cost = Base AP + (skill_stage × 1)
```
- Stage 0: 5 AP
- Stage 5: 10 AP

### Cooldown
```
Cooldown = Base CD + (skill_stage × 0.5) turns
```
- Stage 0: 1 turn
- Stage 5: 3.5 turns

### Debuff Duration
```
Debuff Turns = 2 + skill_stage
```

## Variant Modifiers

| Variant | Damage Mod | AP Mod | Special |
|---------|------------|--------|---------|
| ⬆️ Upgrade | +5% per stage | +0 | Pure stat boost |
| 🔄 Original | +0% | +0 | Different execution |
| 💪 Buff | -5% | +1 | Adds buff effect |
| 💀 Debuff | -5% | +1 | Adds debuff effect |
| ✨ Unique | ±10% random | ±2 random | Wildcard |
| 💥 AoE | -10% | +2 | Hits multiple |
| ⛓️ Combo | -15% per hit | +0 | Multi-hit (2-4x) |
| 🛡️ Counter | +10% | +0 | Requires trigger |
| 💨 Mobility | -5% | +1 | Adds movement |
| ❤️‍🩹 Sustain | -10% | +1 | Adds recovery |

## Buff Types

| Buff | Effect |
|------|--------|
| Haste | +20% attack speed |
| Empower | +15% damage |
| Fortify | +15% defense |
| Focus | +10% crit chance |
| Regen | +3% HP per turn |

## Debuff Types

| Debuff | Effect |
|--------|--------|
| Slow | -20% movement speed |
| Bleed | 5% max HP per turn |
| Armor Break | -15% defense |
| Weaken | -10% damage output |
| Blind | -20% accuracy |

## UI Flow

```
1. Choose Weapon Category → Show 10 starter skill cards
2. Click starter skill → Go to skill page
3. Generate 5 children:
   - 1 UPGRADE (always)
   - 4 RANDOM (from 9 other variants)
4. Skills shown as cards (not saved yet)
5. Click "Save" → Save to database
6. Click "Regenerate" → Discard and generate new set
7. Click any child card → Navigate to that skill page
8. Repeat generation for next stage
```

## Database Fields

```typescript
interface Skill {
  id: string
  name: string
  description: string
  
  // Core stats
  apCost: number
  cooldown: number
  damagePercent: number
  
  // Variant info
  variantType: VariantType
  stage: number
  
  // Effects (optional based on variant)
  buffType?: string
  buffDuration?: number
  debuffType?: string
  debuffDuration?: number
  lifestealPercent?: number
  hitCount?: number
  aoeRadius?: number
  
  // Relations
  parentId: string
  starterSkillName: string
  categoryId: string
  
  // State
  isSaved: boolean
}
```
