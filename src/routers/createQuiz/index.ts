import express from 'express'
import quizRouter from './quiz'
import sectionRouter from './section'
import questionRouter from './question'

const router = express.Router()

router.use('/quiz', quizRouter)
router.use('/section', sectionRouter)
router.use('/question', questionRouter)

export default router
