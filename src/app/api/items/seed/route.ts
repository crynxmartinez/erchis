import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { STARTER_ITEMS } from '@/data/items-data'

// POST - Seed all items from data file
export async function POST() {
  try {
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    }

    for (const itemData of STARTER_ITEMS) {
      try {
        // Check if item already exists
        const existing = await prisma.item.findUnique({
          where: { name: itemData.name },
        })

        if (existing) {
          results.skipped++
          continue
        }

        // Create the item
        await prisma.item.create({
          data: {
            name: itemData.name,
            description: itemData.description,
            icon: itemData.icon,
            itemType: itemData.itemType,
            useEffect: itemData.useEffect || null,
            effectValue: itemData.effectValue || 0,
            equipSlot: itemData.equipSlot || null,
            statBonuses: itemData.statBonuses || {},
            buyPrice: itemData.buyPrice,
            sellPrice: itemData.sellPrice,
            maxStack: itemData.maxStack,
            isUnique: itemData.isUnique,
            rarity: itemData.rarity,
          },
        })

        results.created++
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`${itemData.name}: ${message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.created} items, skipped ${results.skipped} existing`,
      results,
    })
  } catch (error) {
    console.error('Error seeding items:', error)
    const message = error instanceof Error ? error.message : 'Failed to seed items'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
