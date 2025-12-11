# Skill Generation System

This document defines the rules for generating the fractal skill tree system.

---

## 1. Naming Convention

### 1.1 Skill Name Structure

```
[Prefix] + [Core Action] + [Suffix]
```

**Prefixes by Stage:**
| Stage | Prefixes |
|-------|----------|
| 1 | Quick, Swift, Light, Sharp, Keen |
| 2 | Rapid, Flash, Precise, True, Deadly |
| 3 | Phantom, Shadow, Blazing, Storm, Thunder |
| 4 | Grand, Supreme, Ultimate, Legendary, Divine |
| 5 | Infinite, Eternal, Transcendent, Godlike, Absolute |

**Core Actions (Sword-specific):**
| Category | Actions |
|----------|---------|
| Attack | Slash, Cut, Strike, Blade, Edge, Sweep, Thrust, Pierce, Rend, Cleave |
| Combo | Flurry, Barrage, Chain, Sequence, Rush, Assault, Onslaught |
| Movement | Step, Dash, Lunge, Leap, Flash, Blink, Phase, Warp |
| Defense | Parry, Guard, Counter, Deflect, Riposte, Block, Ward |
| Control | Break, Shatter, Crush, Disarm, Stun, Bind, Root |
| Buff | Focus, Charge, Empower, Enhance, Surge, Boost |
| Debuff | Weaken, Bleed, Wound, Cripple, Slow, Drain |

**Suffixes by Effect Type:**
| Effect | Suffixes |
|--------|----------|
| Single Target | Strike, Blow, Hit, Thrust, Jab |
| Multi-Hit | Combo, Flurry, Barrage, Chain, Rush |
| AoE | Wave, Storm, Burst, Nova, Spiral |
| DoT | Edge, Wound, Bleed, Burn, Poison |
| Buff | Stance, Form, Aura, Spirit, Force |
| Debuff | Break, Crush, Rend, Shatter, Pierce |
| Movement | Step, Dash, Flash, Phase, Warp |
| Counter | Return, Revenge, Retaliation, Reflect, Reprisal |

### 1.2 Naming Examples

**Stage 1:**
- Quick Slash → Double Slash, Step-In Slash, Precision Cut, Guard-Cut Slash

**Stage 2 (children of Double Slash):**
- Rapid Twin Strike, Flash Dual Edge, Precise Double Cut, True Paired Blade

**Stage 3 (children of Rapid Twin Strike):**
- Phantom Dual Assault, Shadow Twin Barrage, Blazing Pair Rush, Storm Double Onslaught

---

## 2. Stat Scaling Formulas

### 2.1 Base Stats by Stage

| Stage | Base Damage | AP Cost | Cooldown | Accuracy | Crit Chance |
|-------|-------------|---------|----------|----------|-------------|
| 0 | 100% | 5 | 0.5s | +10% | +0% |
| 1 | 110% | 5-8 | 0.4-1.2s | +15% | +5% |
| 2 | 125% | 6-12 | 0.3-1.5s | +20% | +10% |
| 3 | 145% | 7-15 | 0.25-2.0s | +25% | +15% |
| 4 | 170% | 8-20 | 0.2-3.0s | +30% | +20% |
| 5 | 200% | 10-30 | 0.15-10s | +35% | +25% |

### 2.2 Scaling Multipliers

```typescript
const STAGE_MULTIPLIERS = {
  damage: [1.0, 1.1, 1.25, 1.45, 1.70, 2.0],
  apCost: [1.0, 1.0, 1.2, 1.4, 1.6, 2.0],
  cooldown: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5],
  accuracy: [10, 15, 20, 25, 30, 35],
  critChance: [0, 5, 10, 15, 20, 25],
}
```

### 2.3 Skill Type Modifiers

| Type | Damage Mod | AP Mod | Cooldown Mod | Special |
|------|------------|--------|--------------|---------|
| Attack | 1.0x | 1.0x | 1.0x | - |
| Combo | 0.7x per hit | 1.5x | 1.5x | Multi-hit |
| Movement | 1.1x | 1.2x | 1.3x | +Range |
| Counter | 1.5x | 0.8x | 0.8x | Conditional |
| AoE | 0.8x | 1.8x | 2.0x | Multi-target |
| DoT | 0.6x initial | 1.0x | 1.5x | +Bleed/Burn |
| Buff | 0x | 1.2x | 2.0x | Self-buff |
| Debuff | 0.7x | 1.3x | 1.5x | Enemy debuff |
| Execution | 2.0x | 2.0x | 3.0x | HP threshold |
| Ultimate | 3.0x | 3.0x | 10.0x | Powerful |

---

## 3. Effect Pool

### 3.1 Effect Categories

**Damage Effects:**
- Bonus damage to [guarding/bleeding/low HP/debuffed] enemies
- Ignores [X]% armor
- Guaranteed crit on [condition]
- Damage scales with [combo points/missing HP/distance]

**Control Effects:**
- Stun for [X]s
- Knockback [X]m
- Slow by [X]% for [X]s
- Root for [X]s
- Disarm for [X]s

**Buff Effects:**
- +[X]% attack speed for [X]s
- +[X]% damage for next [X] attacks
- +[X]% evasion for [X]s
- Gain [X] combo points
- Restore [X]% AP on kill

**Debuff Effects:**
- Reduce target defense by [X]%
- Reduce target damage by [X]%
- Apply Bleed ([X]% damage over [X]s)
- Mark target (take [X]% more damage)
- Reduce healing received by [X]%

**Movement Effects:**
- Dash [X]m forward
- Teleport behind target
- Become untargetable for [X]s
- Phase through enemies
- Gain i-frames during animation

**Utility Effects:**
- Cannot be interrupted
- Chains into [skill type]
- Resets cooldown on [condition]
- Refunds [X]% AP on [condition]

---

## 4. Passive Generation

### 4.1 Passive Template

```
[Skill Name] [Effect Type]: [Description]
```

**Effect Types by Stage:**
| Stage | Passive Power |
|-------|---------------|
| 1 | 5% bonus / minor effect |
| 2 | 10% bonus / moderate effect |
| 3 | 15% bonus / significant effect |
| 4 | 20% bonus / major effect |
| 5 | 25% bonus / game-changing effect |

### 4.2 Passive Examples

- Stage 1: *Swift Blade* - Quick Slash attacks are 5% faster
- Stage 2: *Blade Flow* - After Quick Slash, next skill costs 10% less AP
- Stage 3: *Relentless Edge* - 15% chance to reset cooldown
- Stage 4: *Sword Mastery* - All tree skills deal 10% more damage
- Stage 5: *Blade Grandmaster* - 20% chance to trigger skill twice

---

## 5. Child Skill Archetypes

Each skill spawns 4 children following these archetypes:

| Archetype | Focus | Example Suffix |
|-----------|-------|----------------|
| **Power** | Higher damage, slower | Crusher, Breaker, Devastator |
| **Speed** | Lower damage, faster, more hits | Flurry, Rush, Barrage |
| **Utility** | Adds control/buff/debuff | Binder, Weakener, Enhancer |
| **Mobility** | Adds movement/positioning | Dasher, Phaser, Warper |

This ensures variety - no two siblings are the same type.

---

## 6. Generation Algorithm

```typescript
interface Skill {
  id: string
  name: string
  parentId: string | null
  stage: number
  type: SkillType
  archetype: Archetype
  damage: number
  apCost: number
  cooldown: number
  effect: string
  passive: string | null
  children: string[] // IDs of 4 children
}

function generateChildren(parent: Skill): Skill[] {
  const archetypes = ['power', 'speed', 'utility', 'mobility']
  const children: Skill[] = []
  
  for (const archetype of archetypes) {
    const child = {
      id: generateId(),
      name: generateName(parent, archetype),
      parentId: parent.id,
      stage: parent.stage + 1,
      type: deriveType(parent.type, archetype),
      archetype: archetype,
      damage: calculateDamage(parent, archetype),
      apCost: calculateApCost(parent, archetype),
      cooldown: calculateCooldown(parent, archetype),
      effect: generateEffect(archetype, parent.stage + 1),
      passive: generatePassive(parent.stage + 1),
      children: [] // Will be filled when this skill evolves
    }
    children.push(child)
  }
  
  return children
}
```

---

## 7. Implementation Plan

1. **Create base skill data** (Stage 0-2 manually) - 31 skills
2. **Build TypeScript generator** using rules above
3. **Generate Stage 3-5** programmatically - 3,094 skills
4. **Export to JSON** for database seeding
5. **Validate uniqueness** - no duplicate names

Total: **3,125 unique skills** in Quick Slash family alone
