import express from 'express'
import * as commonController from '@controllers/common'
import isOnboard from '@utils/isOnboard'
import isAdmin from '@utils/isAdmin'

const router = express.Router()

router.get('/searchUsers', isOnboard, isAdmin, commonController.searchUsers)

export default router
