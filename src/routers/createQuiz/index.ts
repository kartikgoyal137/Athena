import express from 'express'
import quizRouter from './quiz'
import sectionRouter from './section'
import questionRouter from './question'
import managerRouter from './managers'

const router = express.Router()

router.use('/quiz', quizRouter)
router.use('/section', sectionRouter)
router.use('/question', questionRouter)
router.use('/managers', managerRouter)

export default router
