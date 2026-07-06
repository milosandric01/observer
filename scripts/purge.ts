import { Pool } from 'pg'

const url = process.env.DATABASE_URL || 'postgresql://localhost:5432/observer'
const pool = new Pool({ connectionString: url })

async function purge() {
  console.log('Purging all data from observer database...')
  await pool.query('DELETE FROM events')
  await pool.query('DELETE FROM sessions')
  await pool.query('DELETE FROM projects')
  console.log('Done. All projects, sessions, and events deleted.')
  await pool.end()
}

purge().catch((err) => {
  console.error('Purge failed:', err.message)
  process.exit(1)
})
