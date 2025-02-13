import { Response, Request } from 'express'
import { JwtPayload } from 'types'
import QuizModel from '@models/quiz/quizModel'
import sendFailureResponse from '@utils/failureResponse'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import getQuiz from '@utils/getQuiz'
import isParticipant from '@utils/isParticipant'

interface registerQuizRequest extends Request {
  body: {
    customFields: {
      name: string
      value: string
    }[]
    user: JwtPayload
  }
  params: {
    quizId: string
  }
}

const registerQuiz = async (req: registerQuizRequest, res: Response) => {
  const { quizId } = req.params
  const { customFields, user } = req.body

  if (!quizId || !user) {
    return sendInvalidInputResponse(res)
  }

  try {
    const quiz = await getQuiz(quizId)
    if (!quiz) {
      return sendInvalidInputResponse(res)
    }

    // Check if quiz is published
    if (!quiz.isPublished) {
      return sendFailureResponse({
        res,
        error: 'Error registering quiz, this quiz is already published',
        messageToSend: 'Error registering quiz, this quiz is already published',
        errorCode: 400,
      })
    }

    // Check if user is already registered
    const isUserRegistered = isParticipant(user.userId, quiz?.participants)

    if (isUserRegistered) {
      return sendFailureResponse({
        res,
        error: 'Error registering quiz, user is already registered',
        messageToSend: 'Error registering quiz, user is already registered',
        errorCode: 400,
      })
    }

    const updatedQuiz = await QuizModel.findByIdAndUpdate(
      quizId,
      {
        $push: {
          participants: {
            userId: user.userId,
            submitted: false,
            registrationData: { customFields },
            startTime: 0,
          },
        },
      },
      { new: true },
    )
    if (!updatedQuiz) {
      return sendFailureResponse({
        res,
        error: 'Error registering quiz',
        messageToSend: 'Error registering quiz',
        errorCode: 500,
      })
    }

    return res.status(200).send({ message: 'Quiz registered', quizId: updatedQuiz._id })
  } catch (err) {
    console.log(err)
    return sendFailureResponse({
      res,
      error: 'Error registering quiz',
      messageToSend: 'Error registering quiz',
      errorCode: 500,
    })
  }
}

export default registerQuiz
