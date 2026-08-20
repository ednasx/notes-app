import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import pool from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import redisClient from './config/redis.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

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

const server = app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`)
})

const shutdown = async (signal) => {
    console.log(`${signal} received - shutting down gracefully`)

    // 1. Stop accepting new connections; wait for in-flight requests to finish
    server.close(async () => {
        console.log('HTTP server closed')

        // 2. Close database + cache connections cleanly
        try {
            await pool.end()
            console.log('Postgres pool closed')

            await redisClient.quit()
            console.log('Redis client closed')

            // 3. Clean exit
            process.exit(0)
        } catch (err) {
            console.error('Error during shutdown:', err)
            process.exit(1)
        }
    })

    // Safety net: force-exit if graceful shutdown hangs
    setTimeout(() => {
        console.error('Graceful shutdown timed out - forcing exit')
        process.exit(1)
    }, 8000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

export default app