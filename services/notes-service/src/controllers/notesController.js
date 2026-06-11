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

        return res.status(201).json({
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

export const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 })

        return res.status(200).json({
            notes
        })

    } catch (error) {
        console.error('Get all notes error:', error.message)
        return res.status(500).json({
            error: 'Internal server error'
        })
    }
}

export const getNoteById = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, userId: req.userId })

        if (!note) {
            return res.status(404).json({
                error: 'Note not found'
            })
        }

        return res.status(200).json({
            note
        })

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'Invalid note ID format'
            })
        }

        console.error('Get note error:', error.message)
        return res.status(500).json({
            error: 'Internal server error'
        })
    }
}

export const updateNote = async (req, res) => {
    try {
        const { title, content, tags } = req.body

        if (title !== undefined && title.trim() === '') {
            return res.status(400).json({
                error: 'Title cannot be empty'
            })
        }

        const updates = {}
        if (title !== undefined) updates.title = title
        if (content !== undefined) updates.content = content
        if (tags !== undefined) updates.tags = tags

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                error: 'No fields provided to update'
            })
        }

        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            updates,
            { new: true, runValidators: true }
        )

        if (!note) {
            return res.status(404).json({
                error: 'Note not found'
            })
        }

        return res.status(200).json({
            message: 'Note updated successfully',
            note
        })

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'Invalid note ID format'
            })
        }

        console.error('Update note error:', error.message)
        return res.status(500).json({
            error: 'Internal server error'
        })
    }
}