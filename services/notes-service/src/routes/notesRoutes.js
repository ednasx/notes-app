import { Router } from 'express'
import authenticate from '../middleware/authenticate.js'
import { createNote } from '../controllers/notesController.js'

const router = Router()

router.post('/', authenticate, createNote)

export default router