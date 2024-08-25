import express from 'express'
import * as profilePageController from '@controllers/profilePage'
import isOnboard from '@utils/isOnboard'

const router = express.Router()

router.get('/', isOnboard, profilePageController.getUserProfile)

export default router