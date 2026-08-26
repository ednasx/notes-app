import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import pool from './config/db.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()

// Parse TRUST_PROXY: numeric strings -> number (hop count),
// everything else -> string (e.g. 'loopback', 'uniquelocal', a subnet)
const trustProxyEnv = process.env.TRUST_PROXY
if (trustProxyEnv !== undefined) {
    const asNumber = Number(trustProxyEnv)
    app.set('trust proxy', Number.isInteger(asNumber) ? asNumber : trustProxyEnv)
}

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)

// app.get('/api/auth/_debug/ip', (req, res) => {
//     res.json({
//         'req.ip': req.ip,
//         'trust proxy setting': req.app.get('trust proxy'),
//         'x-forwarded-for': req.headers['x-forwarded-for']
//     })
// })


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

export default app