import sendInvalidInputResponse from '@utils/invalidInputResponse'
import { Request, Response } from 'express'
import QuizModel from '@models/quiz/quizModel'
import sendFailureResponse from '@utils/failureResponse'
import { scheduleJob } from 'node-schedule'
import logger from '@utils/logger'
import { JwtPayload } from 'types'
import { Types } from 'mongoose'

interface publishQuizRequest extends Request {
  body: {
    user: JwtPayload
  }
  params: {
    quizId: string
  }
}
// TODO: check that the quiz is perfect in terms that all data is present
const startQuizScheduler = async (quizId: Types.ObjectId, startDateTimestamp: Date) => {
  const job = scheduleJob(startDateTimestamp, async () => {
    try {
      // set isAcceptingAnswers to true
      const startedQuiz = await QuizModel.findByIdAndUpdate(
        quizId,
        { isAcceptingAnswers: true },
        { new: true },
      )
      if (!startedQuiz) {
        logger.error('🔴 ERROR in starting Quiz ' + quizId)
        return
      }
      logger.debug('🔔 Quiz ' + quizId + ' scheduled at ' + startDateTimestamp + ' started')
    } catch (err) {
      logger.error('🔴 ERROR in starting Quiz ' + quizId)
      logger.error(err)
    }
  })
}

const endQuizScheduler = async (quizId: Types.ObjectId, endDateTimestamp: Date) => {
  const job = scheduleJob(endDateTimestamp, async () => {
    try {
      // set isAcceptingAnswers to false
      const endQuiz = await QuizModel.findByIdAndUpdate(
        quizId,
        { isAcceptingAnswers: false },
        { new: true },
      )
      if (!endQuiz) {
        logger.error('🔴 ERROR in ending Quiz ' + quizId)
        return
      }
      logger.debug('🔔 Quiz ' + quizId + ' scheduled to end at ' + endDateTimestamp + ' ended')
    } catch (err) {
      logger.error('🔴 ERROR in ending Quiz ' + quizId)
      logger.error(err)
    }
  })
}

const publishQuiz = async (req: publishQuizRequest, res: Response) => {
  if (!req.body.user || !req.params.quizId) {
    return sendInvalidInputResponse(res)
  }

  const quizId = req.params.quizId

  try {
    // publish the quiz
    const publishedQuiz = await QuizModel.findByIdAndUpdate(
      quizId,
      { isPublished: true, isAcceptingAnswers: true },
      { new: true },
    )

    // send the response back
    if (!publishedQuiz) {
      return sendFailureResponse({
        res,
        error: 'Error publishing quiz',
        messageToSend: 'Error publishing quiz',
        errorCode: 404,
      })
    } else {
      // schedule the quiz
      const startDateTimestamp = publishedQuiz.quizMetadata?.startDateTimestamp
      const endDateTimestamp = publishedQuiz.quizMetadata?.endDateTimestamp

      if (startDateTimestamp && endDateTimestamp) {
        // @ts-ignore
        startQuizScheduler(publishedQuiz._id, startDateTimestamp)
        // @ts-ignore
        endQuizScheduler(publishedQuiz._id, endDateTimestamp)
      }

      return res.status(200).send({ message: 'Quiz published', quizId: publishedQuiz._id })
    }
  } catch (error) {
    return sendFailureResponse({
      res,
      error,
      messageToSend: 'Failed to publish quiz',
    })
  }
}

export default publishQuiz
