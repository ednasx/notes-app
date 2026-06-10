import { Router } from 'express'
import authenticate from '../middleware/authenticate.js'
import { createNote, getAllNotes } from '../controllers/notesController.js'

const router = Router()

router.post('/', authenticate, createNote)
router.get('/', authenticate, getAllNotes)

export default router