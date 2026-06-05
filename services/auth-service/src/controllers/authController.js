import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    )

    return { accessToken, refreshToken }
}

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Name, email and password are required'
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters'
            })
        }

        const existingUser = await User.findByEmail(email)
        if (existingUser) {
            return res.status(409).json({
                error: 'An account with this email already exists'
            })
        }

        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        })

        const { accessToken, refreshToken } = generateTokens(newUser.id)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(201).json({
            message: 'Account created successfully',
            user: newUser,
            accessToken
        })
    } catch (error) {
        console.error('Registration error:', error.message)
        return res.status(500).json({
            error: 'Internal server error'
        })
    }
}