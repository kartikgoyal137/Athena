import { Request, Response } from 'express'
import QuestionModel from '@models/question/questionModel'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import sendFailureResponse from '@utils/failureResponse'
import { JwtPayload } from 'types'

interface getQuestionRequest extends Request {
  params: {
    questionId: string
  }
  body: {
    user: JwtPayload
  }
}
const getQuestion = async (req: getQuestionRequest, res: Response) => {
  const questionId = req.params.questionId
  if (!questionId) {
    return sendInvalidInputResponse(res)
  }
  try {
    const question = await QuestionModel.findById(questionId)
    if (!question) {
      return sendInvalidInputResponse(res)
    }
    const response = {
      type: question.type,
      description: question.description,
      options: question.options,
      maxMarks: question.maxMarks,
      checkersNotes: question.checkersNotes,
    }
    return res.status(200).json({
      message: 'Question fetched successfully',
      question: response,
    })
  } catch (error: unknown) {
    return sendFailureResponse({
      res,
      error,
      messageToSend: 'Error in fetching question',
    })
  }
}

export default getQuestion
