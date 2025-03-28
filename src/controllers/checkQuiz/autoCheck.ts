import { Request, Response } from 'express'
import sendFailureResponse from '@utils/failureResponse'
import { QuestionTypes, ResponseStatus } from 'types'
import QuizModel from '@models/quiz/quizModel'
import ResponseModel from '@models/response/responseModel'

interface autoCheckRequest extends Request {
  params: {
    quizId: string
  }
}

const autoCheck = async (req: autoCheckRequest, res: Response) => {
  const quizId = req.params.quizId

  try {
    const quiz = await QuizModel.findById(quizId).populate({
      path: 'sections.questions',
      select: 'type correctAnswer maxMarks _id autoCheck',
    })

    quiz?.sections?.forEach(async (section) => {
      section?.questions?.forEach(async (question) => {
        if (question.type === QuestionTypes.MCQ && question.autoCheck) {
          await ResponseModel.updateMany(
            { quizId: quizId, questionId: question._id },
            [
              {
                $set: {
                  marksAwarded: {
                    $cond: {
                      if: { $setEquals: ['$selectedOptionId', question.correctAnswer] }, // Check if the arrays have the same elements
                      then: question.maxMarks,
                      else: 0,
                    },
                  },
                  status: ResponseStatus.checked,
                },
              },
            ],
          )
        }
      })
    })

    return res.status(200).json({
      success: true,
      message: 'Autocheck successful',
    })
  } catch (error: unknown) {
    return sendFailureResponse({
      res,
      error,
      messageToSend: 'Failed to autocheck answers',
    })
  }
}

export default autoCheck
