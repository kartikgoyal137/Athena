import express from 'express'
import * as commonController from '@controllers/common'

const router = express.Router()

router.get('/searchUsers', commonController.searchUsers)

export default router