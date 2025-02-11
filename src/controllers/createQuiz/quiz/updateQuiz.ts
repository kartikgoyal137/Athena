import sendInvalidInputResponse from '@utils/invalidInputResponse'
import { Request, Response } from 'express'
import QuizModel from '@models/quiz/quizModel'
import { IQuiz, JwtPayload } from 'types'
import sendFailureResponse from '@utils/failureResponse'
import { Types } from 'mongoose'

interface updateQuizRequest extends Request {
  body: {
    managers?: IQuiz['managers']
    quizMetadata?: IQuiz['quizMetadata']
    registrationMetadata?: IQuiz['registrationMetadata']
    user: JwtPayload
  }
  params: {
    quizId: string
  }
}

const updateQuiz = async (req: updateQuizRequest, res: Response) => {
  if (!req.body || !req.params.quizId || !req.body.user) {
    return sendInvalidInputResponse(res)
  }

  // get the data from the request body
  const { managers: managerStrings, quizMetadata, registrationMetadata } = req.body

  // Parsing to Object ID from string[]
  const managers: Types.ObjectId[] | undefined = managerStrings?.map((id) => new Types.ObjectId(id))

  const quizId = req.params.quizId
  try {
    // the fields present in the request body are only updated
    // this helps to prevent overwriting of the data and also use the same API for updating different fields
    const quiz = await QuizModel.findByIdAndUpdate(
      quizId,
      {
        ...(managers && { managers }),
        ...(quizMetadata && { quizMetadata }),
        ...(registrationMetadata && { registrationMetadata }),
      },
      { new: true },
    )
    // send the response back
    if (!quiz) {
      return sendFailureResponse({
        res,
        error: 'Error updating quiz',
        messageToSend: 'Error updating quiz',
        errorCode: 404,
      })
    } else {
      return res.status(200).send({
        message: 'Quiz updated',
        updatedParameters: { quizId: quiz._id, managers, quizMetadata, registrationMetadata },
      })
    }
  } catch (error: unknown) {
    sendFailureResponse({
      res,
      error,
      messageToSend: 'Failed to update quiz',
    })
  }
}

export default updateQuiz
