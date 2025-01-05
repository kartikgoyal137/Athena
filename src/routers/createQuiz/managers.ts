import express from 'express'
import * as questionController from '@controllers/createQuiz/quiz'
import hasEditAccess from '@utils/hasEditAccess'
import isOnboard from '@utils/isOnboard'

const router = express.Router()

router.get('/searchManagers', questionController.searchManagers)

export default router