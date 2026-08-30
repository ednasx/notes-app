import { afterAll, afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals'
import request from 'supertest'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'


// Load TEST env (separate DB + secret) BEFORE importing the app
// Anchored to THIS file's location on disk, so it resolves correctly no matter 
// which directory the test process was launched from
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') })

// Dynamic import AFTER dotenv so app.js initialises against the test env
const app = (await import('../app.js')).default


// A stable fake user id to own the notes this suite creates.
const testUserId = new mongoose.Types.ObjectId().toString()

// Forge a token the real authenticate middleware will accept:
// signed with the same JWT_SECRET the middleware verifies with,
// carrying { userId } because authenticate does req.userId = decoded.userId
const token = jwt.sign({ userId: testUserId }, process.env.JWT_SECRET)


beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI)
})

afterEach(async () => {
    // Wipe every collection so each test starts from an empty DB.
    const collections = mongoose.connection.collections
    for (const key in collections) {
        await collections[key].deleteMany({})
    }
})


afterAll(async () => {
    await mongoose.connection.close()
})

describe('POST /api/notes', () => {

    it('rejects an unauthenticated request with 401', async () => {
        const res = await request(app)
            .post('/api/notes')
            .send({ title: 'No taken note'})
        
        expect(res.status).toBe(401)
        expect(res.body.error).toBe('Access token required')
    })

    it('creates a note with 201 when authenticated and valid', async () => {
        const res = await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'My first note', content: 'Hello world'})

        expect(res.status).toBe(201)
        expect(res.body.message).toBe('Note created successfully')
        expect(res.body.note.title).toBe('My first note')
        expect(res.body.note.content).toBe('Hello world')
        // The note is owned by the token's user - per-user scoping
        expect(res.body.note.userId).toBe(testUserId)
    })

    it('rejects a note with a missing title with 400', async () => {
        const res = await request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Body but no title'})

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Title is required')
    })
})