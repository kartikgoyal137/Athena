import express from 'express'
import * as profilePageController from '@controllers/profilePage'
import isOnboard from '@utils/isOnboard'

const router = express.Router()

router.get('/', isOnboard, profilePageController.getUserProfile)
router.post('/update', isOnboard, profilePageController.updateUser)

export default router