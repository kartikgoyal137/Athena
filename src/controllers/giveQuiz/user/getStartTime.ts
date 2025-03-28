import { Response, Request } from 'express'
import QuizModel from '@models/quiz/quizModel'
import { JwtPayload, QuizUserStatus } from 'types'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import isParticipant from '@utils/isParticipant'
import { checkQuizUserStatus } from '@utils/checkQuizUserStatus'
import sendFailureResponse from '@utils/failureResponse'
import ParticipantModel from '@models/participant/participantModel'

interface getStartTimeRequest extends Request {
  body: {
    user: JwtPayload
  }
  params: {
    quizId: string
  }
}

const getStartTime = async (req: getStartTimeRequest, res: Response) => {
  const { user } = req.body
  const { quizId } = req.params

  if (!user) {
    return sendInvalidInputResponse(res)
  }

  try {
    const quiz = await QuizModel.findById(quizId)

    if (!quiz || !quiz.isPublished) {
      return sendFailureResponse({
        res,
        error: new Error('Quiz does not exist'),
        messageToSend: 'Quiz does not exist',
        errorCode: 404,
      })
    }
    const participant = await isParticipant(user.userId, quiz._id)

    if (!participant) {
      return sendFailureResponse({
        res,
        error: new Error('User is not registered for the quiz'),
        messageToSend: 'User is not registered for the quiz',
        errorCode: 403,
      })
    }

    const currentStatus = checkQuizUserStatus(quiz, participant)
    const quizEndTime = quiz?.quizMetadata?.endDateTimestamp as any
    const quizDuration = quiz?.quizMetadata?.duration as any
    const quizDurationInMs = quizDuration * 60 * 1000
    const currentTime = new Date().getTime()

    const calculateUserLeftTime = (startTime: number) => {
      const timeUntilQuizEnd = quizEndTime - currentTime
      const timeUntilUserEnd = startTime + quizDurationInMs - currentTime
      return Math.min(timeUntilQuizEnd, timeUntilUserEnd)
    }

    if (currentStatus === QuizUserStatus.userIsGivingQuiz) {
      const userLeftTime = calculateUserLeftTime(participant.startTime)
      return res.status(200).json({
        success: false,
        message: 'User is already giving the quiz',
        userLeftTime,
      })
    } else if (currentStatus === QuizUserStatus.userNotStarted) {
      const quizStartTime = new Date().getTime()
      await ParticipantModel.updateOne(
        { quizId: quiz._id, userId: participant.userId },
        {
          $set: {
            startTime: quizStartTime,
          },
        },
      )
      const userLeftTime = calculateUserLeftTime(quizStartTime)
      return res.status(200).json({
        success: true,
        message: 'Quiz timer set successfully',
        userLeftTime,
      })
    } else {
      return sendFailureResponse({
        res,
        error: new Error('Invalid request on the getStartTime endpoint'),
        messageToSend: 'Invalid request on the getStartTime endpoint',
        errorCode: 400,
      })
    }
  } catch (error) {
    return sendFailureResponse({
      res,
      error: new Error('Internal server error'),
      messageToSend: 'Internal server error',
      errorCode: 500,
    })
  }
}

export default getStartTime
