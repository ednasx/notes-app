import { Router } from 'express'
import authenticate from '../middleware/authenticate.js'
import { createNote, getAllNotes, getNoteById } from '../controllers/notesController.js'

const router = Router()

router.post('/', authenticate, createNote)
router.get('/', authenticate, getAllNotes)
router.get('/:id', authenticate, getNoteById)

export default router