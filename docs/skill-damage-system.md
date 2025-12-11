# Skill & Damage System

## 1. Damage Formula

```
Damage = WeaponBase × SkillAmp
```

### Components:
- **WeaponBase** = Weapon category's base damage % (40-140%)
- **SkillAmp** = Skill's amplifier % (varies by skill)
- **Stats** = Used for **requirements only**, NOT damage calculation

---

## 2. Weapon Base Damage Table

| # | Category | Type | Base Dmg | Passive |
|---|----------|------|----------|---------|
| 1 | Sword | Melee | 80% | +10% Parry |
| 2 | Greatsword | Melee | 120% | +25% Stagger |
| 3 | Katana | Melee | 75%/95% | +10%/+20% Counter |
| 4 | Dagger | Melee | 60% | +15% Crit Chance |
| 5 | Axe | Melee | 85% | +15% vs Guard |
| 6 | Greataxe | Melee | 140% | +20% vs Low HP |
| 7 | Mace | Melee | 80% | +15% Armor Pen |
| 8 | Greathammer | Melee | 130% | +20% Stun Chance |
| 9 | Spear | Melee | 75%/90% | +1 Range |
| 10 | Fist | Melee | 50% | +1 Hit Count |
| 11 | Bow | Ranged | 85% | +2 Range |
| 12 | Crossbow | Ranged | 100% | +25% Armor Pen |
| 13 | Gun | Ranged | 75% | +10% Crit Damage |
| 14 | Staff | Magic | 90% | +20% AoE Size |
| 15 | Wand | Magic | 70% | -1 CD (magic) |
| 16 | Tome | Magic | 65% | +30% Buff Duration |
| 17 | Shield | Defense | 40% | +30% Block Chance |

---

## 3. Physical vs Magic Damage

| Type | Amp Range | Can Crit? | Notes |
|------|-----------|-----------|-------|
| **Physical** | 50-100% | Yes | Lower amp, compensated by crit chance |
| **Magic** | 100-150% | No | Higher amp, consistent damage |
| **None** | 0% | No | Non-damage skills (utility, buffs, etc.) |

### Balance Logic:
- Physical has lower amp but can crit (burst potential)
- Magic has higher consistent amp but no crit
- Both are viable, different playstyles

---

## 4. Skill Amp Tiers (Stage 0 Starter Skills)

### Physical Skills (50-100% amp, can crit)

| Subtype | Amp % | AP Cost | Cooldown | Notes |
|---------|-------|---------|----------|-------|
| Basic | 60% | 3 | 1 | Standard attack |
| Fast | 50% | 2 | 1 | Quick, low damage |
| Power | 80% | 5 | 2 | Heavy, slow |
| AoE | 70% | 5 | 2 | Hits multiple |
| Stun | 60% | 4 | 2 | Adds stagger |
| Combo | 50% | 4 | 1 | Multi-hit potential |
| Movement | 65% | 4 | 1 | Attack + reposition |

### Magic Skills (100-150% amp, no crit)

| Subtype | Amp % | AP Cost | Cooldown | Notes |
|---------|-------|---------|----------|-------|
| Elemental | 110% | 4 | 2 | Fire, Ice, Lightning |
| Arcane | 100% | 3 | 1 | Basic magic |
| AoE Burst | 120% | 5 | 3 | Area damage |
| DoT | 100% | 4 | 2 | Damage over time |

### Non-Damage Skills (0% amp)

| Category | Amp % | AP Cost | Cooldown | Range |
|----------|-------|---------|----------|-------|
| Defensive | 0% | 2-3 | 1-2 | 0 (self) |
| Buffs | 0% | 3 | 3 | 0 (self) |
| Debuffs | 0% | 3 | 2 | 2 |
| Movement | 0% | 2 | 1 | 2-3 (distance) |
| Utility | 0% | 1-2 | 1 | 0-3 |
| Support | 0% | 3-4 | 2-3 | 1-2 |

---

## 5. Skill Amp Progression by Stage

As skills evolve through stages, amp increases:

| Stage | Physical Amp | Magic Amp |
|-------|--------------|-----------|
| 0 | 50-80% | 100-120% |
| 1 | 60-90% | 110-130% |
| 2 | 70-100% | 120-140% |
| 3 | 80-110% | 130-150% |
| 4 | 90-120% | 140-160% |
| 5 | 100-130% | 150-170% |

---

## 6. Variant Modifiers

When generating child skills, apply these modifiers to parent's amp:

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

## 7. Example Damage Calculations

### Physical Slash (60% amp) with different weapons:

| Weapon | Base | Skill Amp | Final Damage |
|--------|------|-----------|--------------|
| Dagger | 60% | 60% | 36% |
| Sword | 80% | 60% | 48% |
| Greatsword | 120% | 60% | 72% |
| Greataxe | 140% | 60% | 84% |

**With Crit (1.5x):**
| Weapon | Base | Skill Amp | Crit | Final |
|--------|------|-----------|------|-------|
| Sword | 80% | 60% | 1.5x | 72% |
| Greataxe | 140% | 60% | 1.5x | 126% |

### Magic Fireball (110% amp) with magic weapons:

| Weapon | Base | Skill Amp | Final Damage |
|--------|------|-----------|--------------|
| Tome | 65% | 110% | 71.5% |
| Wand | 70% | 110% | 77% |
| Staff | 90% | 110% | 99% |

---

## 8. Skill Categories Summary

### 100 Starter Skills in 9 Categories:

| Category | Count | Damage Type | Weapon Req | Amp Range |
|----------|-------|-------------|------------|-----------|
| Melee Attacks | 15 | physical | melee_only | 50-80% |
| Ranged Attacks | 12 | physical | ranged_only | 50-80% |
| Magic Attacks | 12 | magic | magic_only | 100-120% |
| Defensive | 10 | none | any | 0% |
| Buffs | 10 | none | any | 0% |
| Debuffs | 8 | none | any | 0% |
| Movement | 10 | none | any | 0% |
| Utility/Awareness | 10 | none | any | 0% |
| Support | 9 | none | any | 0% |
| **Total** | **96** | | | |

---

## 9. Key Rules

1. **Stats are for requirements only** - Not used in damage calculation
2. **Physical can crit, Magic cannot** - This is the core balance
3. **Weapon base varies by category** - Dagger 60%, Greataxe 140%
4. **Skills are universal** - Not locked to weapon categories
5. **Weapons modify skills** - Base damage %, passive bonuses, AoE override
6. **Stage 0 skills are weak** - They grow stronger through evolution
