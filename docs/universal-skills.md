# Universal Skills / Actions (No Weapon Required)

These are **always-available, non-magic actions** focused on **movement, defense, basic combat, utility, and support**.

They do **not** depend on weapon type, class, or magic.

---

## Skill Groups Overview

- **Movement Skills** – repositioning, mobility, terrain interaction
- **Defensive Skills** – blocking, dodging, mitigating damage
- **Offensive / Control Skills** – basic attacks, crowd control, aggro
- **Utility / Awareness Skills** – detection, interaction, info, mode switching
- **Recovery / Support Skills** – healing, stabilizing, helping allies

---

## 1. Movement Skills (8 skills)

> Movement-related actions: closing gaps, escaping danger, navigating terrain.

| Skill | Type | Description |
|-------|------|-------------|
| **Dash** | Movement | A quick burst of forward movement to close gaps, escape danger, or reposition. Short distance, low cooldown. |
| **Sprint** | Movement | Sustained increased movement speed for a short duration. Drains stamina while active. |
| **Jump** | Movement | Vertical or directional jump. Used to clear gaps, reach higher terrain, or avoid ground-based effects. |
| **Roll** | Movement / Defensive | A low, fast roll that moves the character a short distance while lowering their hitbox. Great for avoiding projectiles or area attacks. |
| **Slide** | Movement | Slide forward while sprinting, allowing you to pass through low spaces, close distance, or slip under attacks. |
| **Vault / Climb** | Movement | Quickly climb or vault over low obstacles, ledges, or walls. Used for verticality and terrain-based tactics. |
| **Crouch** | Movement / Stealth | Lower your stance to reduce noise and visibility. Increases stealth and slightly reduces ranged hit chance against you. |
| **Disengage** | Movement / Defensive | Carefully retreat from melee range without provoking counterattacks. A safe repositioning action. |

---

## 2. Defensive Skills (4 skills)

> Actions focused on avoiding damage, reducing damage, or punishing attacks.

| Skill | Type | Description |
|-------|------|-------------|
| **Dodge** | Defensive / Movement | A fast sidestep/roll to avoid an incoming attack. Temporarily increases evasion or grants brief "i-frame" timing. |
| **Guard** | Defensive | Enter a guarding stance to block or reduce damage from the next hit(s). May consume stamina instead of HP. |
| **Counter** | Defensive / Attack | After a successful Guard (or Dodge), perform a quick retaliatory strike that deals bonus damage or ignores some defense. |
| **Brace** | Defensive | Root yourself in place, gaining extra resistance to knockback, launch, or crowd control, at the cost of reduced movement. |

---

## 3. Offensive / Control Skills (5 skills)

> Non-weapon, non-magic actions that still affect enemies: damage, push, control, aggro.

| Skill | Type | Description |
|-------|------|-------------|
| **Kick** | Attack / Control | A basic unarmed strike. Can interrupt light attacks, push enemies back, or break weak guards. |
| **Shove** | Attack / Control | A forceful push that can knock enemies back, push them off ledges, or break their formation. |
| **Grapple** | Attack / Control | Attempt to grab and restrain a target. Can pin weaker enemies, interrupt casting, or set up throws or takedowns. |
| **Taunt** | Utility / Aggro | Provoke enemies to focus attacks on you instead of allies. May reduce your defense or require Guard/Dodge to survive. |
| **Mark Target** | Utility / Support | Tag one enemy, slightly increasing damage dealt by you (and maybe allies) to that target, or improving hit chance. |

---

## 4. Utility / Awareness Skills (6 skills)

> Information, interaction, and mode-switching actions that support gameplay but aren't direct attacks.

| Skill | Type | Description |
|-------|------|-------------|
| **Detect** | Utility / Awareness | Heightened senses. Reveal hidden enemies, traps, or clues within a certain radius or line of sight. |
| **Inspect** | Utility / Info | Examine an enemy or object to reveal basic info (HP type, armor type, weakness hints, etc.). |
| **Interact** | Utility | Generic action to open doors, pull levers, pick up items, disarm traps, or activate environmental objects. |
| **Focus** | Utility / Offensive | Take a brief moment to steady yourself. Increases accuracy, crit chance, or power of your **next attack or skill**. |
| **Change Stance** | Utility / Self-Buff | Swap between predefined stances (e.g., Offensive, Defensive, Mobile). Each stance changes your stats slightly (damage, defense, speed). |
| **Quick Swap** | Utility / Weapon Handling | Instantly swap between your main weapon set (e.g., Greatsword) and an alternate set (e.g., Sword + Shield). The action itself is universal; it only requires you to have two sets equipped. |

---

## 5. Recovery / Support Skills (3 skills)

> Non-magic ways to sustain yourself and help allies.

| Skill | Type | Description |
|-------|------|-------------|
| **Rest** | Recovery | Take a brief pause to recover a small amount of HP or stamina over time. Less effective in combat, stronger out of combat. |
| **Stabilize** | Recovery / Support | Stop an ally from bleeding out or dying. Prevents death timer from ticking down but doesn't fully heal. |
| **Help Up** | Support / Movement | Pull a downed or prone ally back on their feet faster than normal recovery time. |

---

## Summary

| Category | Count | Skills |
|----------|-------|--------|
| Movement | 8 | Dash, Sprint, Jump, Roll, Slide, Vault/Climb, Crouch, Disengage |
| Defensive | 4 | Dodge, Guard, Counter, Brace |
| Offensive/Control | 5 | Kick, Shove, Grapple, Taunt, Mark Target |
| Utility/Awareness | 6 | Detect, Inspect, Interact, Focus, Change Stance, Quick Swap |
| Recovery/Support | 3 | Rest, Stabilize, Help Up |
| **Total** | **26** | |

---

## Implementation Notes

### Database Schema

```prisma
model Skill {
  // ... existing fields
  isUniversal   Boolean @default(false)  // true = no weapon required
  skillGroup    String  // "movement", "defensive", "offensive", "utility", "recovery"
}
```

### Skill Learning

- All universal skills are **free to learn** from Skill Trainer NPC
- Players start with basic skills: Dash, Jump, Guard, Kick, Rest
- Other universal skills unlocked as player levels up or completes tutorials

### Skill Bar

- Universal skills can be placed in any skill bar slot
- Some skills (Interact, Quick Swap) may be bound to dedicated keys instead
