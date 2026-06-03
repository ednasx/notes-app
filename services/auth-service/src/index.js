import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import pool from './config/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT NOW()')
        res.status(200).json({
            status: 'ok',
            service: 'auth-service',
            database: 'connected',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        res.status(500).json({
            status: 'error',
            service: 'auth-service',
            database: 'disconnected',
            timestamp: new Date().toISOString()
        })
    }
})

app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`)
})

export default app