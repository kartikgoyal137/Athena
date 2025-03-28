import { Response, Request } from 'express'
import { JwtPayload } from 'types'
import sendFailureResponse from '@utils/failureResponse'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import getQuiz from '@utils/getQuiz'
import isParticipant from '@utils/isParticipant'
import ParticipantModel from '@models/participant/participantModel'

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
        error: 'Quiz does not exist',
        messageToSend: 'Quiz does not exist',
        errorCode: 404,
      })
    }

    // Check if user is already registered
    const isUserRegistered = await isParticipant(user.userId, quiz._id)

    if (isUserRegistered) {
      return sendFailureResponse({
        res,
        error: 'Error registering quiz, user is already registered',
        messageToSend: 'Error registering quiz, user is already registered',
        errorCode: 409,
      })
    }

    const participant = new ParticipantModel({
      userId: user.userId,
      quizId: quiz._id,
      submitted: false,
      registrationData: { customFields },
      startTime: 0,
    })
    await participant.save()

    if (!participant) {
      return sendFailureResponse({
        res,
        error: 'Error registering quiz',
        messageToSend: 'Error registering quiz',
        errorCode: 500,
      })
    }

    return res.status(200).send({ message: 'Quiz registered', quizId: quiz._id })
  } catch (err) {
    return sendFailureResponse({
      res,
      error: 'Error registering quiz',
      messageToSend: 'Error registering quiz',
      errorCode: 500,
    })
  }
}

export default registerQuiz
