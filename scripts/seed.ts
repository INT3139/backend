import { pool } from '../src/configs/db'
import fs from 'fs'
import path from 'path'

async function runSeed() {
  const seedsDir = path.join(__dirname, '../src/db/seeds')
  const files = fs
    .readdirSync(seedsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  console.log('--- Database Seeding ---')
  for (const file of files) {
    console.log(`> Running seed file: ${file}`)
    const filePath = path.join(seedsDir, file)
    const sql = fs.readFileSync(filePath, 'utf8')

    try {
      await pool.query(sql)
      console.log(`[✓] Seeded ${file}`)
    } catch (error) {
      console.error(`[✗] Failed to seed ${file}:`, error)
    }
  }
}

runSeed()
  .then(() => {
    console.log('--- All seeds completed ---')
    process.exit(0)
  })
  .catch((err) => {
    console.error('--- Seeding failed ---', err)
    process.exit(1)
  })
