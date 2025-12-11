import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

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
  result: any[] = [],
  idToNameMap: Map<string, string> = new Map()
): { skills: any[], idToNameMap: Map<string, string> } {
  idToNameMap.set(skill.id, skill.name)
  
  result.push({
    originalId: skill.id,
    name: skill.name,
    description: skill.effect,
    categoryId: categoryId,
    starterSkillName: starterSkillName,
    parentOriginalId: skill.parentId,
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
    flattenTree(child, starterSkillName, categoryId, result, idToNameMap)
  }
  
  return { skills: result, idToNameMap }
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

export async function POST(request: Request) {
  try {
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
      return NextResponse.json({ error: 'Quick Slash JSON not found' }, { status: 404 })
    }
    
    const treeData: SkillTreeNode = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    
    // Flatten the tree
    const { skills, idToNameMap } = flattenTree(treeData, 'Quick Slash', swordCategory.id)
    console.log(`Found ${skills.length} skills to seed`)
    
    // Delete existing skills for this starter skill (clean slate)
    await prisma.skill.deleteMany({
      where: { starterSkillName: 'Quick Slash' }
    })
    console.log('Cleared existing Quick Slash skills')
    
    // Create a map to track name -> new DB ID
    const nameToDbId = new Map<string, string>()
    
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
      
      nameToDbId.set(skill.name, created.id)
    }
    
    console.log('Created all skills, now linking parents...')
    
    // Second pass: update parent references
    let linkedCount = 0
    for (const skill of skills) {
      if (skill.parentOriginalId) {
        const parentName = idToNameMap.get(skill.parentOriginalId)
        if (parentName) {
          const parentDbId = nameToDbId.get(parentName)
          const childDbId = nameToDbId.get(skill.name)
          
          if (parentDbId && childDbId) {
            await prisma.skill.update({
              where: { id: childDbId },
              data: { parentId: parentDbId }
            })
            linkedCount++
          }
        }
      }
    }
    
    console.log(`Linked ${linkedCount} parent references`)
    console.log('Skill seeding complete!')
    
    return NextResponse.json({ 
      success: true, 
      totalSkills: skills.length,
      linkedParents: linkedCount
    })
  } catch (error) {
    console.error('Error seeding skills:', error)
    return NextResponse.json({ error: 'Failed to seed skills', details: String(error) }, { status: 500 })
  }
}
