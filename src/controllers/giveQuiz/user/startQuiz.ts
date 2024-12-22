import { Response, Request } from 'express'
import QuizModel from '@models/quiz/quizModel'
import { IParticipant, IQuiz, JwtPayload, QuizUserStatus } from 'types'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import isParticipant from '@utils/isParticipant'
import { checkQuizUserStatus } from '@utils/checkQuizUserStatus'
import sendFailureResponse from '@utils/failureResponse'

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
    const dbUser = isParticipant(user.userId, quiz?.participants)
    const currentStatus = checkQuizUserStatus(quiz as IQuiz, dbUser as IParticipant)

    if (!quiz || !quiz.isPublished || !dbUser) {
      return sendFailureResponse({
        res,
        error: new Error('User not registered for this quiz'),
        messageToSend: 'User not registered for this quiz',
        errorCode: 400,
      })
    }

    if (quiz.quizMetadata?.accessCode !== accessCode) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access code',
      })
    }

    switch (currentStatus) {
      case QuizUserStatus.userIsGivingQuiz:
        return res.status(200).json({
          success: true,
          message: 'Quiz resumed successfully',
        })

      case QuizUserStatus.userNotStarted:
        await quiz.save()
        return res.status(200).json({
          success: true,
          message: 'Quiz started successfully',
        })

      case QuizUserStatus.autoSubmitQuiz:
        dbUser.submitted = true
        await quiz.save()
        console.log('Auto submit quiz')
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
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
export default startQuiz
