import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load the TEST database connection BEFORE anything imports db.js.
// This points the whole test run at authdb_test, never authdb.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') })

const { default: request } = await import('supertest')
const { default: app } = await import('../app.js')
const { default: pool } = await import('../config/db.js')
const { default: redisClient } = await import('../config/redis.js')     // I import it here purely so I have a handle to close it later; Due to ripple effect from the app import,
                                                                        // redis client connection opened, so in the test, we have to close it to prevent jest from hanging

describe('POST /api/auth/register', () => {

    // Clean the users table after each test so every test starts empty. 
    // Guarantees repeatability: no leftover rows poison the next run.
    afterEach(async () => {
        await pool.query('DELETE FROM users')
    })


    // Close the DB pool once all tests finish, so the process can exit 
    // cleanly instead of hanging on an open connection handle.
    afterAll(async ()=> {
        await pool.end()
        await redisClient.quit()
    })

    it('registers a new user and returns 201 without leaking the password', async () =>  {
        const newUser = {
            name: 'Test User',
            email: 'test.user@example.com', 
            password: 'supersecret123'
        }

        const response = await request(app)
            .post('/api/auth/register')
            .send(newUser)

        expect(response.status).toBe(201)
        expect(response.body.message).toBe('Account created successfully')
        expect(response.body).toHaveProperty('accessToken')


        expect(response.body.user).toBeDefined()
        expect(response.body.user.email).toBe(newUser.email)
        expect(response.body.user.name).toBe(newUser.name)
        expect(response.body.user).toHaveProperty('id')


        // Security guard: the password (hashed or not) must never come back.
        expect(response.body.user.password).toBeUndefined()
    })

    it('rejects registration with a missing password and returns 400', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'No Password',
                email: 'no.password@example.com'
            })
        
        expect(response.status).toBe(400)
        expect(response.body.error).toBe('Name, email and password are required')
    })
})