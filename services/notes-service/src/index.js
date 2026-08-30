import dotenv from 'dotenv'
import connectDB from './config/db.js'
import mongoose from 'mongoose'
import app from './app.js'

dotenv.config()

await connectDB()

const PORT = process.env.PORT || 3002

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