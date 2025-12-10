import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  // Create or get admin user
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  })
  
  // Create player if doesn't exist
  const player = await prisma.player.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      level: 1,
      exp: 0,
      col: 0,
      str: 0,
      agi: 0,
      vit: 0,
      int: 0,
      dex: 0,
      luk: 0,
      statPoints: 25,
      currentHp: 100,
      currentAp: 100,
      maxAp: 100,
      currentFloor: 1,
      currentArea: 'town',
    },
  })
  
  console.log('Admin user:', admin)
  console.log('Player data:', player)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
