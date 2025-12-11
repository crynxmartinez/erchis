import fs from 'fs'
import path from 'path'
import prisma from '../src/lib/prisma'

interface SkillTreeNode {
  id: string
  name: string
  parentId: string | null
  parentName: string | null
  stage: number
  type: string
  archetype: string
  damage: string
  apCost: number
  cooldown: string
  effect: string
  passive: string | null
  children: SkillTreeNode[]
}

function flattenTree(
  skill: SkillTreeNode, 
  starterSkillName: string,
  categoryId: string,
  result: any[] = []
): any[] {
  result.push({
    name: skill.name,
    description: skill.effect,
    categoryId: categoryId,
    starterSkillName: starterSkillName,
    parentId: skill.parentId,
    stage: skill.stage,
    archetype: skill.archetype,
    skillType: skill.type,
    damage: skill.damage,
    apCost: skill.apCost,
    cooldown: skill.cooldown,
    passive: skill.passive,
    isBasic: skill.stage === 0,
    usesRequired: getUsesRequired(skill.stage),
  })
  
  for (const child of skill.children) {
    flattenTree(child, starterSkillName, categoryId, result)
  }
  
  return result
}

function getUsesRequired(stage: number): number {
  const thresholds: Record<number, number> = {
    0: 0,
    1: 100,
    2: 300,
    3: 500,
    4: 900,
    5: 1500,
  }
  return thresholds[stage] || 0
}

async function seedSkills() {
  console.log('Starting skill seed...')
  
  // First, get or create the Sword weapon category
  let swordCategory = await prisma.weaponCategory.findUnique({
    where: { name: 'Sword' }
  })
  
  if (!swordCategory) {
    swordCategory = await prisma.weaponCategory.create({
      data: {
        name: 'Sword',
        description: 'Balanced melee weapon',
        primaryStat: 'STR',
        isRanged: false,
        isTwoHanded: false,
        isMagic: false,
      }
    })
    console.log('Created Sword category')
  }
  
  // Load the Quick Slash skill tree JSON
  const jsonPath = path.join(process.cwd(), 'src/data/skill-trees/quick-slash.json')
  
  if (!fs.existsSync(jsonPath)) {
    console.error('Quick Slash JSON not found at:', jsonPath)
    return
  }
  
  const treeData: SkillTreeNode = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  
  // Flatten the tree
  const skills = flattenTree(treeData, 'Quick Slash', swordCategory.id)
  console.log(`Found ${skills.length} skills to seed`)
  
  // Delete existing skills for this starter skill (clean slate)
  await prisma.skill.deleteMany({
    where: { starterSkillName: 'Quick Slash' }
  })
  console.log('Cleared existing Quick Slash skills')
  
  // Create a map to track old ID -> new ID for parent references
  const idMap = new Map<string, string>()
  
  // First pass: create all skills without parent references
  for (const skill of skills) {
    const created = await prisma.skill.create({
      data: {
        name: skill.name,
        description: skill.description,
        categoryId: skill.categoryId,
        starterSkillName: skill.starterSkillName,
        stage: skill.stage,
        archetype: skill.archetype,
        skillType: skill.skillType,
        damage: skill.damage,
        apCost: skill.apCost,
        cooldown: skill.cooldown,
        passive: skill.passive,
        isBasic: skill.isBasic,
        usesRequired: skill.usesRequired,
      }
    })
    
    // Map the original tree ID to the new database ID
    const originalId = skills.find(s => s.name === skill.name)?.parentId
    idMap.set(skill.name, created.id)
  }
  
  console.log('Created all skills, now linking parents...')
  
  // Second pass: update parent references
  for (const skill of skills) {
    if (skill.parentId) {
      // Find the parent skill by looking up in the original tree
      const parentSkill = skills.find(s => {
        // The parentId in the JSON is the original tree ID
        // We need to find the skill whose name matches the parent
        return s.name === treeData.name || findSkillById(treeData, skill.parentId)?.name === s.name
      })
      
      // Actually, let's use a different approach - find parent by traversing
      const parentNode = findSkillById(treeData, skill.parentId)
      if (parentNode) {
        const parentDbId = idMap.get(parentNode.name)
        const childDbId = idMap.get(skill.name)
        
        if (parentDbId && childDbId) {
          await prisma.skill.update({
            where: { id: childDbId },
            data: { parentId: parentDbId }
          })
        }
      }
    }
  }
  
  console.log('Skill seeding complete!')
  console.log(`Total skills in database: ${skills.length}`)
}

function findSkillById(tree: SkillTreeNode, id: string): SkillTreeNode | null {
  if (tree.id === id) return tree
  
  for (const child of tree.children) {
    const found = findSkillById(child, id)
    if (found) return found
  }
  
  return null
}

seedSkills()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
