import pool from '../config/db.js'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const runMigrations = async () => {
    const client = await pool.connect()

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id          SERIAL PRIMARY KEY,
                filename    VARCHAR(255) UNIQUE NOT NULL,
                run_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )    
        `)

        const migrationsDir = join(__dirname, 'migrations')
        const files = readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort()

        for (const file of files) {
            const existing = await client.query(
                'SELECT id FROM migrations WHERE filename = $1',
                [file]
            )

            if (existing.rowCount > 0) {
                console.log(`Skipping migration: ${file} (already run)`)
                continue
            }

            console.log(`Running migration: ${file}`)
            const sql = readFileSync(join(migrationsDir, file), 'utf8')

            const upSection = sql
                .split('-- DOWN')[0]
                .replace(/--.*$/gm, '')
                .trim()

            await client.query(upSection)
            await client.query(
                'INSERT INTO migrations (filename) VALUES ($1)',
                [file]
            )
            console.log(`Completed migration: ${file}`)
        }

        console.log('All migrations completed successfully')
    } catch (error) {
        console.error('Migration failed:', error.message)
        throw error
    } finally {
        client.release()
        await pool.end()
    }
}

runMigrations()