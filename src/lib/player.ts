// Player stat calculations and utilities

// HP Regen: 1 HP per 5 minutes
export const HP_REGEN_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

// AP Regen: 1 AP per 10 minutes
export const AP_REGEN_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes

// Calculate max HP based on VIT
// Base 100 + (VIT × 10)
export function calculateMaxHp(vit: number): number {
  return 100 + vit * 10
}

// Calculate HP regen since last regen time
export function calculateHpRegen(lastRegen: Date, currentHp: number, maxHp: number): { newHp: number; newLastRegen: Date } {
  const now = new Date()
  const elapsed = now.getTime() - lastRegen.getTime()
  const regenTicks = Math.floor(elapsed / HP_REGEN_INTERVAL_MS)
  
  if (regenTicks <= 0) {
    return { newHp: currentHp, newLastRegen: lastRegen }
  }
  
  const newHp = Math.min(currentHp + regenTicks, maxHp)
  const newLastRegen = new Date(lastRegen.getTime() + regenTicks * HP_REGEN_INTERVAL_MS)
  
  return { newHp, newLastRegen }
}

// Calculate AP regen since last regen time
export function calculateApRegen(lastRegen: Date, currentAp: number, maxAp: number): { newAp: number; newLastRegen: Date } {
  const now = new Date()
  const elapsed = now.getTime() - lastRegen.getTime()
  const regenTicks = Math.floor(elapsed / AP_REGEN_INTERVAL_MS)
  
  if (regenTicks <= 0) {
    return { newAp: currentAp, newLastRegen: lastRegen }
  }
  
  const newAp = Math.min(currentAp + regenTicks, maxAp)
  const newLastRegen = new Date(lastRegen.getTime() + regenTicks * AP_REGEN_INTERVAL_MS)
  
  return { newAp, newLastRegen }
}

// Stat effect calculations
export const STAT_EFFECTS = {
  str: {
    physDamage: 2,      // +2 per point
    critDamage: 0.01,   // +1% per point
  },
  agi: {
    evasion: 0.005,     // +0.5% per point
    accuracy: 0.003,    // +0.3% per point
  },
  vit: {
    hp: 10,             // +10 per point
    healBonus: 0.01,    // +1% per point
  },
  int: {
    magicAmp: 0.003,    // +0.3% per point
    debuffResist: 0.005, // +0.5% per point
  },
  dex: {
    critChance: 0.003,  // +0.3% per point
    cdr: 0.005,         // +0.5% per point
  },
  luk: {
    dropRate: 0.005,    // +0.5% per point
  },
}
