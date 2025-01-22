import express from 'express'
import * as authController from '@controllers/auth'
import isAuth from '@utils/isAuth'
import isOnboard from '@utils/isOnboard'

const router = express.Router()

router.post('/google/token', authController.getGoogleToken)
router.post('/github/token', authController.getGithubToken)
router.post('/onboard', isAuth, authController.onboard)
router.get('/', isOnboard, authController.getDashBoard)
router.get('/user', authController.getUser)
router.post('/logout', authController.logout)

export default router
