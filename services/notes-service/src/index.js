import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import notesRoutes from './routes/notesRoutes.js'
import mongoose from 'mongoose'

dotenv.config()

await connectDB()

const app = express()
const PORT = process.env.PORT || 3002

// Parse TRUST_PROXY: numeric strings -> number (hop count),
// everything else -> string (e.g. 'loopback', 'uniquelocal', as subnet)
const trustProxyEnv = process.env.TRUST_PROXY
if (trustProxyEnv !== undefined) {
    const asNumber = Number(trustProxyEnv)
    app.set('trust proxy', Number.isInteger(asNumber) ? asNumber : trustProxyEnv)
}

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/api/notes', notesRoutes)

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'notes-service',
        timestamp: new Date().toISOString()
    })
})

const server = app.listen(PORT, () => {
    console.log(`Notes service running on ${PORT}`)
})

const shutdown = async (signal) => {
    console.log(`${signal} received - shutting down gracefully`)

    server.close(async () => {
        console.log('HTTP server closed')

        try {
            await mongoose.connection.close()
            console.log('MongoDB connection closed')

            process.exit(0)
        } catch (err) {
            console.error('Error during shutdown:', err)
            process.exit(1)
        }
    })

    setTimeout(() => {
        console.error('Graceful shutdown timed out - forcing exit')
        process.exit(1)
    }, 8000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

export default app