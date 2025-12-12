
export interface WeaponStatConfig {
  id: string
  name: string
  baseDamage: number // Multiplier (e.g., 1.4 for 140%)
  passiveDescription: string
  stat: string // Requirement stat
  hands: '1H' | '2H' | 'Versatile'
  aoeType?: 'Cone' | 'Circle' | 'Line' | 'None'
  aoeTargets?: number
  isLight?: boolean // For dual wield rules
}

export const WEAPON_STATS: Record<string, WeaponStatConfig> = {
  // MELEE 2H
  greataxe: {
    id: 'greataxe',
    name: 'Greataxe',
    baseDamage: 1.4,
    passiveDescription: '+20% vs Low HP',
    stat: 'STR',
    hands: '2H',
    aoeType: 'Cone',
    aoeTargets: 3
  },
  greathammer: {
    id: 'greathammer',
    name: 'Greathammer',
    baseDamage: 1.3,
    passiveDescription: '+20% Stun Chance',
    stat: 'STR',
    hands: '2H',
    aoeType: 'Circle',
    aoeTargets: 2
  },
  greatsword: {
    id: 'greatsword',
    name: 'Greatsword',
    baseDamage: 1.2,
    passiveDescription: '+25% Stagger',
    stat: 'STR',
    hands: '2H',
    aoeType: 'Cone',
    aoeTargets: 3
  },

  // RANGED 2H
  crossbow: {
    id: 'crossbow',
    name: 'Crossbow',
    baseDamage: 1.0,
    passiveDescription: '+25% Armor Pen',
    stat: 'DEX',
    hands: '2H'
  },
  bow: {
    id: 'bow',
    name: 'Bow',
    baseDamage: 0.85,
    passiveDescription: '+2 Range',
    stat: 'DEX',
    hands: '2H'
  },

  // MAGIC 2H
  staff: {
    id: 'staff',
    name: 'Staff',
    baseDamage: 0.9,
    passiveDescription: '+20% AoE Size',
    stat: 'INT',
    hands: '2H'
  },

  // MELEE 1H
  axe: {
    id: 'axe',
    name: 'Axe',
    baseDamage: 0.85,
    passiveDescription: '+15% vs Guard',
    stat: 'STR',
    hands: '1H'
  },
  sword: {
    id: 'sword',
    name: 'Sword',
    baseDamage: 0.8,
    passiveDescription: '+10% Parry',
    stat: 'STR',
    hands: '1H'
  },
  mace: {
    id: 'mace',
    name: 'Mace',
    baseDamage: 0.8,
    passiveDescription: '+15% Armor Pen',
    stat: 'STR',
    hands: '1H'
  },
  dagger: {
    id: 'dagger',
    name: 'Dagger',
    baseDamage: 0.6,
    passiveDescription: '+15% Crit Chance',
    stat: 'DEX',
    hands: '1H',
    isLight: true
  },
  fist: {
    id: 'fist',
    name: 'Fist',
    baseDamage: 0.5,
    passiveDescription: '+1 Hit Count',
    stat: 'STR',
    hands: '1H',
    isLight: true
  },

  // RANGED 1H
  gun: {
    id: 'gun',
    name: 'Gun',
    baseDamage: 0.75,
    passiveDescription: '+10% Crit Damage',
    stat: 'DEX',
    hands: '1H'
  },

  // MAGIC 1H
  wand: {
    id: 'wand',
    name: 'Wand',
    baseDamage: 0.7,
    passiveDescription: '-1 Cooldown (Magic)',
    stat: 'INT',
    hands: '1H'
  },
  tome: {
    id: 'tome',
    name: 'Tome',
    baseDamage: 0.65,
    passiveDescription: '+30% Buff Duration',
    stat: 'INT',
    hands: '1H'
  },

  // VERSATILE
  katana: {
    id: 'katana',
    name: 'Katana',
    baseDamage: 0.75, // 1H mode base
    passiveDescription: '+10%/20% Counter',
    stat: 'STR/DEX',
    hands: 'Versatile'
  },
  spear: {
    id: 'spear',
    name: 'Spear',
    baseDamage: 0.75, // 1H mode base
    passiveDescription: '+1 Range',
    stat: 'STR/DEX',
    hands: 'Versatile'
  },

  // DEFENSE
  shield: {
    id: 'shield',
    name: 'Shield',
    baseDamage: 0.6,
    passiveDescription: '+30% Block Chance',
    stat: 'VIT',
    hands: '1H'
  }
}
