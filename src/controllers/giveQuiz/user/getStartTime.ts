import { Response, Request } from 'express'
import QuizModel from '@models/quiz/quizModel'
import { IParticipant, IQuiz, JwtPayload, QuizUserStatus } from 'types'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import isParticipant from '@utils/isParticipant'
import { checkQuizUserStatus } from '@utils/checkQuizUserStatus'
import sendFailureResponse from '@utils/failureResponse'

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

    const dbUser = isParticipant(user.userId, quiz?.participants)

    if (!quiz || !quiz.isPublished || !dbUser) {
      return sendFailureResponse({
        res,
        error: new Error('User not registered for this quiz'),
        messageToSend: 'User not registered for this quiz',
        errorCode: 400,
      })
    }

    const currentStatus = checkQuizUserStatus(quiz as IQuiz, dbUser as IParticipant);
    const quizEndTime = quiz?.quizMetadata?.endDateTimestamp as any;
    const quizDuration = quiz?.quizMetadata?.duration as any;
    const quizDurationInMs = quizDuration * 60 * 1000;
    const currentTime = new Date().getTime();
    
    const calculateUserLeftTime = (startTime: number) => {
      const timeUntilQuizEnd = quizEndTime - currentTime;
      const timeUntilUserEnd = startTime + quizDurationInMs - currentTime;
      return Math.min(timeUntilQuizEnd, timeUntilUserEnd);
    };

    if (currentStatus === QuizUserStatus.userIsGivingQuiz) {
      const userLeftTime = calculateUserLeftTime(dbUser.startTime);
      return res.status(200).json({
        success: false,
        message: 'User is already giving the quiz',
        userLeftTime,
      })
    } else if (currentStatus === QuizUserStatus.userNotStarted) {
      const quizStartTime = new Date().getTime()
      dbUser.startTime = quizStartTime
      await quiz.save()
      const userLeftTime = calculateUserLeftTime(quizStartTime);
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
