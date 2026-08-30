import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import notesRoutes from './routes/notesRoutes.js'

const app = express()

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

export default app