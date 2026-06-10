import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import notesRoutes from './routes/notesRoutes.js'

dotenv.config()

await connectDB()

const app = express()
const PORT = process.env.PORT || 3002

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

app.listen(PORT, () => {
    console.log(`Notes service running on ${PORT}`)
})

export default app