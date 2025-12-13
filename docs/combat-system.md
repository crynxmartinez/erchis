# Combat System - Full Implementation Plan

## Overview
A turn-based combat system with **unified narrative storytelling** where player and enemy actions are interwoven into one flowing story. Features a **5-slot skill queue** with drag-and-drop, **dice roll mechanics**, and **dynamic narration**.

---

## Table of Contents
- [Core Features](#core-features)
- [Implementation Checklist](#implementation-checklist)
- [Schema Changes](#schema-changes)
- [Combat Flow](#combat-flow)
- [Dice Roll System](#dice-roll-system)
- [Narrative System](#narrative-system)
- [UI Components](#ui-components)

---

## Core Features

### ✅ Confirmed Features
| Feature | Description | Status |
|---------|-------------|--------|
| **5-Slot Skill Queue** | Drag-drop skills/items to queue up to 5 actions per turn | ⬜ Pending |
| **AP-Gated Execution** | Skills execute sequentially until AP runs out | ⬜ Pending |
| **Skill UseCount Tracking** | Each skill use increments useCount for skill evolution | ⬜ Pending |
| **Combo Bonuses** | Reward smart skill sequencing (buff→attack, etc.) | ⬜ Pending |
| **Enemy Intent Preview** | Show what enemy plans to do before player commits | ⬜ Pending |
| **Cooldown System** | Skills go on cooldown after use | ⬜ Pending |
| **Unified Narrative** | Player + enemy actions woven as one story | ⬜ Pending |
| **Dice Roll System** | Hit/miss/crit/dodge rolls behind the scenes | ⬜ Pending |
| **Speed/Priority System** | Determines action order within a turn | ⬜ Pending |
| **Reaction Skills** | Dodge/Guard/Counter trigger against enemy attacks | ⬜ Pending |

---

## Implementation Checklist

### Phase 1: Schema Updates ✅
- [x] **1.1** Add `speed` field to Skill schema (0-100, higher = faster)
- [x] **1.2** Add `isReaction` field to Skill schema (for Dodge/Guard/Counter)
- [x] **1.3** Add narrative template fields to Skill schema
- [x] **1.4** Create Monster schema
- [x] **1.5** Create MonsterSkill schema
- [x] **1.6** Create CombatSession schema
- [x] **1.7** Create CombatLog schema
- [x] **1.8** Add XP fields to Player schema (currentXp, totalXpEarned)
- [x] **1.9** Run Prisma migration

### Phase 2: Combat Engine (Backend) ✅
- [x] **2.1** Create `src/lib/combat/engine.ts` - Core combat logic
- [x] **2.2** Create `src/lib/combat/dice.ts` - Dice roll functions
- [x] **2.3** Create `src/lib/combat/damage.ts` - Damage calculation
- [x] **2.4** Create `src/lib/combat/sequence.ts` - Action sequence interleaving
- [x] **2.5** Create `src/lib/combat/narrator.ts` - Narrative text generator
- [x] **2.6** Create `src/lib/combat/cooldowns.ts` - Cooldown management (in engine.ts)
- [x] **2.7** Create `src/lib/combat/combos.ts` - Combo detection & bonuses

### Phase 3: API Routes ✅
- [x] **3.1** `POST /api/combat/start` - Start combat session
- [x] **3.2** `POST /api/combat/queue` - Submit player action queue (merged into execute)
- [x] **3.3** `POST /api/combat/execute` - Execute turn and get narrative
- [x] **3.4** `POST /api/combat/flee` - Attempt to flee combat
- [x] **3.5** `GET /api/combat/session` - Get current combat state
- [ ] **3.6** `GET /api/combat/log` - Get combat log history

### Phase 4: Combat UI ✅
- [x] **4.1** Create `CombatScreen.tsx` - Main combat view
- [x] **4.2** Create `SkillQueue.tsx` - 5-slot queue (integrated into SkillBar)
- [x] **4.3** Create `CombatNarrative.tsx` - Story display panel
- [x] **4.4** Create `EnemyDisplay.tsx` - Enemy HP, image, intent
- [x] **4.5** Create `PlayerCombatStatus.tsx` - Player HP/AP in combat
- [x] **4.6** Update `SkillBar.tsx` - Click to add to queue
- [ ] **4.7** Implement drag-and-drop functionality (optional enhancement)

### Phase 5: Monster Data ✅
- [x] **5.1** Create MonsterSkill Database (30 reusable skills)
- [x] **5.2** Create Item Database (consumables, materials, key items)
- [x] **5.3** Create Monster Database admin page
- [x] **5.4** Schema: Monsters are standalone objects (no floor/level)
- [x] **5.5** Schema: Skills & Items attach to monsters via junction tables
- [ ] **5.6** Create Floor 1 monsters (5-10 monsters) - use admin page
- [ ] **5.7** Assign skills and loot to monsters - use admin page

### Phase 6: Integration
- [ ] **6.1** Connect hunting areas to combat encounters
- [x] **6.2** Implement XP rewards on victory (in execute route)
- [x] **6.3** Implement Col rewards on victory (in execute route)
- [x] **6.4** Implement skill useCount increment (in execute route)
- [ ] **6.5** Implement player death handling
- [x] **6.6** Implement flee mechanics

### Phase 7: Polish
- [ ] **7.1** Add combat animations/transitions
- [ ] **7.2** Add sound effect hooks (for future)
- [ ] **7.3** Add combat result summary screen
- [ ] **7.4** Add skill evolution notifications

---

## Schema Changes

### Skill Schema Additions
```prisma
model Skill {
  // ... existing fields ...
  
  // Combat Timing
  speed            Int      @default(50)    // 0-100, higher = faster
  isReaction       Boolean  @default(false) // Dodge, Guard, Counter
  
  // Narrative Templates
  narrativeSuccess String?  // "Your blade connects with a satisfying impact!"
  narrativeCrit    String?  // "A devastating blow! Critical hit!"
  narrativeMiss    String?  // "Your swing goes wide, hitting nothing but air."
  narrativeBlocked String?  // "The enemy raises their guard, deflecting your attack."
}
```

### Monster Schema
```prisma
model Monster {
  id              String   @id @default(cuid())
  name            String
  description     String?
  imageUrl        String?
  
  // Location
  floorId         Int
  areaId          String   // Which hunting area spawns this monster
  
  // Stats
  level           Int
  maxHp           Int
  attack          Int      // Base physical damage
  magicAttack     Int      @default(0)  // Base magic damage
  defense         Int      // Damage reduction
  magicDefense    Int      @default(0)
  accuracy        Int      // Hit chance modifier
  evasion         Int      // Dodge chance modifier
  speed           Int      @default(50) // Turn order priority
  
  // Rewards
  xpReward        Int
  xpVariance      Int      @default(0)  // Random +/- variance
  colReward       Int
  colVariance     Int      @default(0)
  
  // Behavior
  attackPatterns  Json     @default("[]") // Array of skill sequence arrays
  
  // Relations
  skills          MonsterSkill[]
  lootTable       LootDrop[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### MonsterSkill Schema
```prisma
model MonsterSkill {
  id              String   @id @default(cuid())
  monsterId       String
  monster         Monster  @relation(fields: [monsterId], references: [id], onDelete: Cascade)
  
  name            String
  description     String?
  
  // Combat Stats
  damageType      String   @default("physical") // physical, magic
  baseDamage      Int
  accuracy        Int      @default(100)  // Hit chance %
  speed           Int      @default(50)   // Action priority
  
  // Effects
  appliesDebuff   String?  // bleed, poison, stun, etc.
  debuffChance    Int?     @default(100)
  debuffDuration  Int?
  debuffValue     Int?
  
  // Narrative
  narrativeUse    String   // "The Goblin lunges with snapping jaws..."
  narrativeHit    String   // "Its fangs sink into your flesh!"
  narrativeMiss   String   // "You sidestep the clumsy attack."
  narrativeCrit   String?  // "A vicious strike! Critical damage!"
  
  createdAt       DateTime @default(now())
}
```

### CombatSession Schema
```prisma
model CombatSession {
  id              String   @id @default(cuid())
  playerId        String
  player          Player   @relation(fields: [playerId], references: [id])
  monsterId       String
  
  // Combat State
  playerHp        Int
  playerAp        Int
  monsterHp       Int
  turn            Int      @default(1)
  status          String   @default("active") // active, won, lost, fled
  
  // Queued Actions
  playerQueue     Json     @default("[]")  // Array of {type: "skill"|"item", id: string}
  enemyQueue      Json     @default("[]")  // Generated from monster AI
  
  // Active Effects
  playerBuffs     Json     @default("[]")  // [{type, value, duration}]
  playerDebuffs   Json     @default("[]")
  monsterBuffs    Json     @default("[]")
  monsterDebuffs  Json     @default("[]")
  
  // Cooldowns
  skillCooldowns  Json     @default("{}")  // {skillId: turnsRemaining}
  
  // Timestamps
  startedAt       DateTime @default(now())
  endedAt         DateTime?
  
  // Relations
  logs            CombatLog[]
}
```

### CombatLog Schema
```prisma
model CombatLog {
  id              String   @id @default(cuid())
  sessionId       String
  session         CombatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  turn            Int
  sequenceOrder   Int      // Order within the turn (1, 2, 3...)
  
  // Actor
  actor           String   // "player" or "monster"
  actionType      String   // "skill", "item", "reaction"
  actionId        String?  // Skill or Item ID
  actionName      String
  
  // Target
  target          String   // "player" or "monster"
  
  // Roll Results
  hitRoll         Int?     // What was rolled (1-100)
  hitNeeded       Int?     // What was needed to hit
  didHit          Boolean  @default(true)
  
  critRoll        Int?
  critNeeded      Int?
  didCrit         Boolean  @default(false)
  
  // Effects
  damageDealt     Int?
  healingDone     Int?
  buffApplied     String?
  debuffApplied   String?
  
  // Narrative
  narration       String   // The story text for this action
  
  createdAt       DateTime @default(now())
}
```

### Player Schema Additions
```prisma
model Player {
  // ... existing fields ...
  
  // XP System
  currentXp       Int      @default(0)
  totalXpEarned   Int      @default(0)
  
  // Combat Relations
  combatSessions  CombatSession[]
}
```

---

## Combat Flow

### Turn Structure
```
┌─────────────────────────────────────────────────────────────┐
│                     TURN FLOW                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. PLANNING PHASE                                          │
│     ├─ Show enemy intent (what they plan to do)             │
│     ├─ Player drags skills/items to 5-slot queue            │
│     ├─ Preview shows total AP cost                          │
│     └─ Player clicks [EXECUTE TURN]                         │
│                                                             │
│  2. SEQUENCE RESOLUTION                                     │
│     ├─ Combine player queue + enemy queue                   │
│     ├─ Sort by speed (highest first)                        │
│     ├─ Execute actions one by one:                          │
│     │   ├─ Check AP (player) or skip                        │
│     │   ├─ Roll dice (hit/miss/crit)                        │
│     │   ├─ Calculate damage/effects                         │
│     │   ├─ Check for reactions (Dodge/Guard/Counter)        │
│     │   ├─ Apply damage/buffs/debuffs                       │
│     │   ├─ Generate narrative text                          │
│     │   ├─ Increment skill useCount (player skills)         │
│     │   └─ Start cooldown                                   │
│     └─ Compile full narrative                               │
│                                                             │
│  3. END OF TURN                                             │
│     ├─ Tick down buff/debuff durations                      │
│     ├─ Tick down cooldowns                                  │
│     ├─ Check win/lose conditions                            │
│     ├─ If combat continues → next turn                      │
│     └─ If combat ends → rewards or death                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Action Priority (Speed)
| Speed Range | Action Type | Examples |
|-------------|-------------|----------|
| 90-100 | Instant | Items, Quick buffs |
| 70-89 | Fast | Light attacks, Dodge |
| 50-69 | Normal | Standard attacks |
| 30-49 | Slow | Heavy attacks |
| 0-29 | Very Slow | Ultimate skills |

---

## Dice Roll System

### Hit Calculation
```typescript
function rollHit(attackerAccuracy: number, defenderEvasion: number): boolean {
  const hitChance = 70 + attackerAccuracy - defenderEvasion  // Base 70%
  const clampedChance = Math.max(5, Math.min(95, hitChance)) // 5-95% range
  const roll = Math.random() * 100
  return roll < clampedChance
}
```

### Critical Hit Calculation
```typescript
function rollCrit(critChance: number): boolean {
  const roll = Math.random() * 100
  return roll < critChance  // Default ~5-15% based on DEX
}
```

### Damage Calculation
```typescript
function calculateDamage(
  baseDamage: number,
  attackerStats: Stats,
  defenderStats: Stats,
  skill: Skill,
  isCrit: boolean,
  buffs: Buff[],
  racialBonus: number
): number {
  let damage = baseDamage
  
  // Apply skill amp
  damage *= (skill.ampPercent / 100)
  
  // Apply stat bonus
  if (skill.damageType === 'physical') {
    damage += attackerStats.str * 2
  } else {
    damage += attackerStats.int * 2
  }
  
  // Apply racial bonus (e.g., Orc +5% physical)
  damage *= (1 + racialBonus / 100)
  
  // Apply buffs
  buffs.forEach(buff => {
    if (buff.type === 'empower') damage *= (1 + buff.value / 100)
  })
  
  // Apply crit
  if (isCrit) {
    const critMultiplier = 1.5 + (attackerStats.str * 0.01) // Base 150% + STR bonus
    damage *= critMultiplier
  }
  
  // Apply defense
  const defense = skill.damageType === 'physical' 
    ? defenderStats.defense 
    : defenderStats.magicDefense
  damage = Math.max(1, damage - defense)
  
  return Math.floor(damage)
}
```

---

## Narrative System

### Template Variables
```
{player}     - Player username
{enemy}      - Monster name
{skill}      - Skill name
{weapon}     - Equipped weapon name
{damage}     - Damage dealt
{healing}    - HP restored
{buff}       - Buff name applied
{debuff}     - Debuff name applied
```

### Narrative Fragments
Each skill has narrative templates that are combined:

```typescript
const narrativeTemplates = {
  // Attack outcomes
  hit: [
    "Your {skill} connects with {enemy}, dealing {damage} damage!",
    "The {skill} lands true, {enemy} takes {damage} damage!",
  ],
  crit: [
    "Critical hit! Your {skill} devastates {enemy} for {damage} damage!",
    "A perfect strike! {enemy} reels from {damage} critical damage!",
  ],
  miss: [
    "Your {skill} whiffs past {enemy}, hitting nothing but air.",
    "{enemy} narrowly avoids your {skill}.",
  ],
  
  // Reactions
  dodged: [
    "You twist away from {enemy}'s attack, avoiding damage entirely.",
    "Your quick reflexes save you as you dodge the incoming blow.",
  ],
  blocked: [
    "You raise your guard, reducing the impact of {enemy}'s attack.",
    "Your defensive stance absorbs most of the blow.",
  ],
  
  // Transitions
  enemyTurn: [
    "{enemy} seizes the opportunity to strike!",
    "Seeing an opening, {enemy} attacks!",
  ],
}
```

### Unified Story Generation
```typescript
function generateTurnNarrative(actions: ResolvedAction[]): string {
  let narrative = ""
  
  for (const action of actions) {
    // Add transition if switching actors
    if (shouldAddTransition(action)) {
      narrative += getTransition(action)
    }
    
    // Add main action narrative
    narrative += action.narration
    
    // Add reaction narrative if applicable
    if (action.triggeredReaction) {
      narrative += action.reactionNarration
    }
    
    narrative += "\n\n"
  }
  
  return narrative
}
```

---

## UI Components

### Combat Screen Layout
```
┌─────────────────────────────────────────────────────────────┐
│  [Enemy Name]  Lv.5                    [Flee Button]        │
│  ████████████░░░░░░░░  HP: 45/100                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │              [Enemy Image/Sprite]                   │    │
│  │                                                     │    │
│  │         Intent: 🗡️ Claw Swipe (Est. 15 dmg)        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 COMBAT NARRATIVE                    │    │
│  │                                                     │    │
│  │  You channel your inner strength, feeling power    │    │
│  │  surge through your muscles...                     │    │
│  │                                                     │    │
│  │  [Scrollable narrative log]                        │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [Player Name]  Lv.3                                        │
│  HP: ████████████░░░░  78/100                               │
│  AP: ██████░░░░░░░░░░  6/15                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ⚔️ ACTION QUEUE          Total AP: 8  [EXECUTE]   │    │
│  │  [Empower] [Slash] [Dodge] [  ] [  ]               │    │
│  │   ↑ Drag from skill/item bars below                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  [Skill Bar: 1-10]                                          │
│  [⚔️][🛡️][💨][⚡][🔥][  ][  ][  ][  ][  ]                  │
│                                                             │
│  [Item Bar: 1-10]                                           │
│  [🧪][🧪][🍖][  ][  ][  ][  ][  ][  ][  ]                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Combo System

### Combo Types
| Combo | Trigger | Bonus |
|-------|---------|-------|
| **Empowered Strike** | Buff → Attack | Buff applies to attack |
| **Double Tap** | Same skill 2x | +10% damage on second |
| **Exploit Weakness** | Debuff → Attack | +15% damage if debuff landed |
| **Defensive Counter** | Guard/Dodge → Counter | Counter gets +20% damage |
| **Finishing Blow** | Any → Execute skill | +50% damage if enemy <20% HP |

---

## File Structure
```
src/
├── lib/
│   └── combat/
│       ├── engine.ts       # Core combat logic
│       ├── dice.ts         # Roll functions
│       ├── damage.ts       # Damage calculation
│       ├── sequence.ts     # Action interleaving
│       ├── narrator.ts     # Story generation
│       ├── cooldowns.ts    # Cooldown management
│       ├── combos.ts       # Combo detection
│       └── types.ts        # TypeScript interfaces
├── app/
│   ├── api/
│   │   └── combat/
│   │       ├── start/route.ts
│   │       ├── queue/route.ts
│   │       ├── execute/route.ts
│   │       ├── flee/route.ts
│   │       └── session/route.ts
│   └── combat/
│       └── [sessionId]/
│           └── page.tsx    # Combat screen
├── components/
│   └── combat/
│       ├── CombatScreen.tsx
│       ├── SkillQueue.tsx
│       ├── CombatNarrative.tsx
│       ├── EnemyDisplay.tsx
│       └── PlayerCombatStatus.tsx
└── data/
    └── monsters/
        └── floor1.ts       # Floor 1 monster definitions
```

---

## Next Steps

1. **Approve this plan** - Confirm the design is correct
2. **Update Skill schema** - Add speed, isReaction, narrative fields
3. **Create new schemas** - Monster, MonsterSkill, CombatSession, CombatLog
4. **Run migration** - Apply schema changes
5. **Build combat engine** - Core logic files
6. **Build API routes** - Combat endpoints
7. **Build UI** - Combat screen components
8. **Create monsters** - Floor 1 monster data
9. **Test & iterate** - Play test and refine

---

*Last Updated: December 13, 2025*
