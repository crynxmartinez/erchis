# Weapon System – Categories & Handedness

## 1. Overview

- All weapons in the game belong to **one of these core categories** (Sword, Axe, Bow, etc.).
- Different weapon names (e.g., *Longsword, Scimitar, Rapier*) **map into the same category** (e.g., *Sword*).
- Weapons are defined by:
  - **Category**
  - **Type** (Melee / Ranged / Magic / Defense)
  - **Primary Stat**
  - **Hands used** (1H / 2H / Versatile)

---

## 2. Hand Rules & Equipment Slots

### 2.1 Hand Slots

- Characters have **2 hand slots**:
  - **Main Hand**
  - **Off Hand**

### 2.2 Hand Types

- **1H (One-Handed)**
  - Uses one hand.
  - Can be equipped in **Main Hand** or **Off Hand**.
- **2H (Two-Handed)**
  - Uses both hands.
  - Occupies **Main + Off Hand** (no off-hand item allowed).
- **Versatile**
  - Can be used as **1H** *or* **2H**.
  - 1H mode → can still use an **Off Hand** item.
  - 2H mode → occupies both hands (no off-hand).

### 2.3 Off-Hand Rules

- **All 1H and Versatile weapons can be used in the Off Hand** (if they are in 1H mode).
- **2H weapons cannot be used in Off Hand**.
- Some items are **Off-Hand only** (if you later decide—e.g., special charms, orbs, etc.).

### 2.4 Shield Special Rule

- **Shield** is a special Defense category:
  - Can be equipped in **Main Hand**.
  - Can be equipped in **Off Hand**.
- This allows setups such as:
  - Sword + Shield
  - Spear (1H) + Shield
  - Shield (Main) + Tome (Off)

---

## 3. Weapon Categories (Master List)

> Note: All actual in-game weapons (e.g., "Longsword", "Zweihänder", "War Pick", "Arcane Grimoire") must map to one of these categories.

### 3.1 Table (Quick Reference)

| # | Category | Type | Stat | Hands | Base Dmg | Passive | AoE Override |
|---|----------|------|------|-------|----------|---------|--------------|
| 1 | Sword | Melee | STR | 1H | 80% | +10% Parry | - |
| 2 | Greatsword | Melee | STR | 2H | 120% | +25% Stagger | Cone (3) |
| 3 | Katana | Melee | STR/DEX | Versatile | 75%/95% | +10%/+20% Counter | - / - |
| 4 | Dagger | Melee | DEX | 1H | 60% | +15% Crit Chance | - |
| 5 | Axe | Melee | STR | 1H | 85% | +15% vs Guard | - |
| 6 | Greataxe | Melee | STR | 2H | 140% | +20% vs Low HP | Cone (3) |
| 7 | Mace | Melee | STR | 1H | 80% | +15% Armor Pen | - |
| 8 | Greathammer | Melee | STR | 2H | 130% | +20% Stun Chance | Circle (2) |
| 9 | Spear | Melee | STR/DEX | Versatile | 75%/90% | +1 Range | - / Line (2) |
| 10 | Fist | Melee | STR | 1H | 50% | +1 Hit Count | - |
| 11 | Bow | Ranged | DEX | 2H | 85% | +2 Range | - |
| 12 | Crossbow | Ranged | DEX | 2H | 100% | +25% Armor Pen | - |
| 13 | Gun | Ranged | DEX | 1H | 75% | +10% Crit Damage | - |
| 14 | Staff | Magic | INT | 2H | 90% | +20% AoE Size | - |
| 15 | Wand | Magic | INT | 1H | 70% | -1 CD (magic) | - |
| 16 | Tome | Magic | INT | 1H | 65% | +30% Buff Duration | - |
| 17 | Shield | Defense | VIT | 1H | 40% | +30% Block Chance | - |

### 3.2 Dual-Wield Bonus
- When dual-wielding, **stack passives from both weapons**
- Example: Sword + Dagger = +10% Parry + 15% Crit Chance

### 3.3 2H AoE Override
- 2H melee weapons force single-target skills to become AoE
- **Cone (3)**: 90° arc hitting up to 3 targets
- **Circle (2)**: 2-tile radius around caster
- **Line (2)**: Straight line hitting 2 targets

---

## 4. Example Loadouts (to Clarify Rules)

| Build | Main Hand | Off Hand | Notes |
|-------|-----------|----------|-------|
| **Classic Knight** | Sword (1H) | Shield (1H) | Standard tank/DPS |
| **Dual Wielder** | Sword (1H) | Dagger (1H Light) | High attack speed |
| **Phalanx** | Spear (1H mode) | Shield | Reach + defense |
| **Great Weapon Warrior** | Greataxe (2H) | — (blocked) | Max damage |
| **Archer** | Bow (2H) | — (blocked) | Ranged DPS |
| **Gunslinger** | Gun (1H) | Gun (1H) or Dagger | Dual pistols or hybrid |
| **Battle Mage** | Wand (1H) | Tome (1H) or Shield | Magic + utility/defense |
| **Defensive Caster** | Shield (1H) | Tome (1H) | Tank mage |

---

## 5. Implementation Notes

### 5.1 Database Schema Updates Needed

```prisma
model WeaponCategory {
  // ... existing fields
  handType      String   // "1H", "2H", "Versatile"
  canMainHand   Boolean  @default(true)
  canOffHand    Boolean  @default(true)
  isLight       Boolean  @default(false)  // For dual-wield bonuses
}
```

### 5.2 Equipment Validation Rules

1. If Main Hand is 2H → Off Hand must be empty
2. If Main Hand is Versatile in 2H mode → Off Hand must be empty
3. 2H weapons cannot be equipped in Off Hand
4. Light weapons (Dagger) get bonus when dual-wielding

### 5.3 Versatile Mode Toggle

- Player can toggle between 1H and 2H mode for Versatile weapons
- 2H mode: +damage bonus, no off-hand
- 1H mode: can use off-hand item

---

## 6. Future Considerations

- **Dual-wield penalties/bonuses**: Off-hand attacks at reduced damage?
- **Weapon proficiency**: Bonus damage for mastered categories
- **Unique weapons**: Legendary items that break normal rules
- **Off-hand only items**: Orbs, charms, bucklers
