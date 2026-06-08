import { query } from "../config/db.js";

const User = {

    async findByEmail(email) {
        const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        )
        return result.rows[0] || null
    },

    async findById(id) {
        const result = await query(
            `SELECT id, name, email, is_verified, created_at
            FROM users
            WHERE id = $1`,
            [id]
        )
        return result.rows[0] || null
    },

    async create({ name, email, password }) {
        const result = await query(
            `INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, is_verified, created_at`,
            [name, email, password]
        )
        return result.rows[0]
    },

    async updatePassword(id, hashedPassword) {
        const result = await query(
            `UPDATE users
            SET password = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, name, email`,
            [hashedPassword, id]
        )
        return result.rows[0] || null
    }
}

export default User