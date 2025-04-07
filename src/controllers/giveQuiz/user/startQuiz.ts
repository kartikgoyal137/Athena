import { Response, Request } from 'express'
import QuizModel from '@models/quiz/quizModel'
import { JwtPayload, QuizUserStatus } from 'types'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import isParticipant from '@utils/isParticipant'
import { checkQuizUserStatus } from '@utils/checkQuizUserStatus'
import sendFailureResponse from '@utils/failureResponse'
import ParticipantModel from '@models/participant/participantModel'

interface startQuizRequest extends Request {
  body: {
    user: JwtPayload
    accessCode?: string
  }
  params: {
    quizId: string
  }
}
const startQuiz = async (req: startQuizRequest, res: Response) => {
  const { user, accessCode } = req.body
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
        error: new Error('User not registered for this quiz'),
        messageToSend: 'User not registered for this quiz',
        errorCode: 403,
      })
    }

    if (quiz.quizMetadata?.accessCode !== accessCode) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access code',
      })
    }
    const currentStatus = checkQuizUserStatus(quiz, participant)

    switch (currentStatus) {
      case QuizUserStatus.userIsGivingQuiz:
        return res.status(200).json({
          success: true,
          message: 'Quiz resumed successfully',
        })

      case QuizUserStatus.userNotStarted:
        return res.status(200).json({
          success: true,
          message: 'Quiz started successfully',
        })

      case QuizUserStatus.autoSubmitQuiz:
        await ParticipantModel.updateOne(
          { quizId: quiz._id, userId: user.userId },
          {
            $set: { submitted: true },
          },
        )
        return res.status(200).json({ message: 'Quiz auto submitted' })

      case QuizUserStatus.submitted:
        return res.status(200).json({ message: 'Quiz already submitted' })

      case QuizUserStatus.quizNotAcceptingAnswers:
        return res.status(200).json({ message: 'Quiz not accepting answers' })

      case QuizUserStatus.quizNotStarted:
        return res.status(200).json({ message: 'Quiz not started' })
      default:
        return sendFailureResponse({
          res,
          error: new Error('Invalid quiz status'),
          messageToSend: 'Invalid quiz status',
          errorCode: 400,
        })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
export default startQuiz
