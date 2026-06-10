import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        content: {
            type: String,
            default: ''
        },
        tags: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
)

const Note = mongoose.model('Note', noteSchema)

export default Note