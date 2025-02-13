import { Response, Request } from 'express'
import QuizModel from '@models/quiz/quizModel'
import { JwtPayload } from 'types'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import sendFailureResponse from '@utils/failureResponse'

interface submitQuizRequest extends Request {
  body: {
    user: JwtPayload
  }
  params: {
    quizId: string
  }
}

const submitQuiz = async (req: submitQuizRequest, res: Response) => {
  const { user } = req.body
  const { quizId } = req.params

  if (!user) {
    return sendInvalidInputResponse(res)
  }

  try {
    const quiz = await QuizModel.findById(quizId)

    if (!quiz || !quiz.isPublished) {
      return sendInvalidInputResponse(res)
    }
    await QuizModel.findByIdAndUpdate(
      quizId,
      {
        $set: {
          'participants.$[elem].submitted': true,
        },
      },
      {
        arrayFilters: [{ 'elem.userId': user.userId }],
      },
    )

    return res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
    })
  } catch (err) {
    return sendFailureResponse({ res, error: err, messageToSend: 'Error while submitting quiz' })
  }
}

export default submitQuiz
