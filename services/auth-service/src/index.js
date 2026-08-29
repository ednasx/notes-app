import app from './app.js'
import pool from './config/db.js'
import redisClient from './config/redis.js'

const PORT = process.env.PORT || 3001

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