import Note from '../models/Note.js'

export const createNote = async (req, res) => {
    try {
        const { title, content, tags } = req.body

        if (!title || title.trim() === '') {
            return res.status(400).json({
                error: 'Title is required'
            })
        }

        const note = await Note.create({
            userId: req.userId,
            title,
            content,
            tags
        })

        return res.status(200).json({
            message: 'Note created successfully',
            note
        })

    } catch (error) {
        console.error('Create note error:', error.message)
        return res.status(500).json({
            error: 'Internal server error'
        })
    }
}