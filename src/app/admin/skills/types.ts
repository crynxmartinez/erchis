import { StarterSkill } from '@/data/universal-skills-data'

export interface Skill {
  id: string
  name: string
  description: string
  executionDescription?: string | null
  parentId: string | null
  parent?: { id: string; name: string } | null
  stage: number
  skillType: string
  damageType: string
  variantType: string
  weaponRequirement: string
  hasUtilityMode: boolean
  utilityEffect?: string | null
  utilityDuration?: number | null
  ampPercent: number
  apCost: number
  cooldown: number
  targetType: string
  range: number
  hitCount: number
  buffType?: string | null
  buffDuration?: number | null
  debuffType?: string | null
  debuffDuration?: number | null
  debuffChance?: number | null
  lifestealPercent?: number | null
  armorPierce?: number | null
  bonusVsGuard?: number | null
  bonusVsDebuffed?: number | null
  isCounter: boolean
  triggerCondition?: string | null
  passive: string | null
  starterSkillName: string
  isSaved: boolean
  isLocked: boolean
  children?: Skill[]
}

export const ALL_VARIANTS = [
  'power',
  'multihit',
  'aoe',
  'rapid',
  'efficiency',
  'dot',
  'control',
  'sustain',
  'defense',
  'execute',
]

export const DAMAGE_TYPES = ['physical', 'magic', 'none']
export const WEAPON_REQS = ['melee_only', 'ranged_only', 'magic_only', 'any']
export const TARGET_TYPES = ['single', 'self', 'aoe_circle', 'aoe_cone', 'aoe_line', 'all_enemies']

export const VARIANT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  root:       { icon: '🌱', color: 'bg-green-900/50 border-green-500 text-green-300', label: 'Root' },
  power:      { icon: '💥', color: 'bg-red-900/50 border-red-500 text-red-300', label: 'Power' },
  multihit:   { icon: '⚔️', color: 'bg-cyan-900/50 border-cyan-500 text-cyan-300', label: 'Multi-Hit' },
  aoe:        { icon: '🌊', color: 'bg-blue-900/50 border-blue-500 text-blue-300', label: 'AoE' },
  rapid:      { icon: '⚡', color: 'bg-yellow-900/50 border-yellow-500 text-yellow-300', label: 'Rapid' },
  efficiency: { icon: '💧', color: 'bg-emerald-900/50 border-emerald-500 text-emerald-300', label: 'Efficiency' },
  dot:        { icon: '☠️', color: 'bg-purple-900/50 border-purple-500 text-purple-300', label: 'Affliction' },
  control:    { icon: '🛑', color: 'bg-orange-900/50 border-orange-500 text-orange-300', label: 'Control' },
  sustain:    { icon: '🩸', color: 'bg-rose-900/50 border-rose-500 text-rose-300', label: 'Sustain' },
  defense:    { icon: '🛡️', color: 'bg-slate-700/50 border-slate-400 text-slate-300', label: 'Defense' },
  execute:    { icon: '💀', color: 'bg-gray-700/50 border-gray-400 text-gray-300', label: 'Execute' },
}
