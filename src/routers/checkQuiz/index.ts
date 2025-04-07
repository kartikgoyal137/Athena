import express from 'express'
import * as checkQuizController from '@controllers/checkQuiz'
import questionRouter from './question'
import responseRouter from './response'
import hasEditAccess from '@utils/hasEditAccess'
import isQuizAdmin from '@utils/isQuizAdmin'
import isOnboard from '@utils/isOnboard'

const router = express.Router()

router.use('/question', questionRouter)
router.use('/response', responseRouter)

router.get(
  '/dashboard/:quizId/:sectionIndex/',
  isOnboard,
  hasEditAccess,
  checkQuizController.getCheckingDashboard,
)
router.get(
  '/dashboard/:quizId/',
  isOnboard,
  hasEditAccess,
  checkQuizController.getCheckingDashboard,
)
router.patch('/autocheck/:quizId', isOnboard, isQuizAdmin, checkQuizController.autoCheck)

router.patch(
  '/leaderboard/:quizId/',
  isOnboard,
  isQuizAdmin,
  checkQuizController.generateLeaderBoard,
)
router.patch(
  '/leaderboard/:quizId/:sectionIndex',
  isOnboard,
  isQuizAdmin,
  checkQuizController.generateLeaderBoard,
)

router.patch('/publish', isOnboard, isQuizAdmin, checkQuizController.publishResults)

export default router
