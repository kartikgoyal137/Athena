import QuestionModel from '@models/question/questionModel'
import ResponseModel from '@models/response/responseModel'
import sendFailureResponse from '@utils/failureResponse'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import { Request, Response } from 'express'
import { JwtPayload, ResponseStatus } from 'types'

interface checkResponseRequest extends Request {
  params: {
    quizId: string
    responseId: string
  }
  body: {
    user: JwtPayload
    marksAwarded: number
  }
}

const checkResponse = async (req: checkResponseRequest, res: Response) => {
  const { quizId, responseId } = req.params
  const { user, marksAwarded } = req.body

  try {
    const response = await ResponseModel.findById(responseId)
    if (!response || response?.quizId.toString() !== quizId) {
      return sendInvalidInputResponse(res)
    }
    await ResponseModel.findByIdAndUpdate(responseId, {
      status: ResponseStatus.checked,
      marksAwarded: marksAwarded,
      checkedBy: user.userId,
    })

    //Increment the checkedAttempts of the question
    await QuestionModel.findByIdAndUpdate(response.questionId, {
      $inc: { checkedAttempts: 1 },
    })

    return res.status(200).json({
      message: 'Response checked',
    })
  } catch (error: unknown) {
    return sendFailureResponse({
      res,
      error,
      messageToSend: 'Failed to check response',
    })
  }
}

export default checkResponse
