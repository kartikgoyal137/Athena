import { Response, Request } from 'express'
import ResponseModel from '@models/response/responseModel'
import { JwtPayload, IResponse, QuizUserStatus } from 'types'
import sendFailureResponse from '@utils/failureResponse'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import QuestionModel from '@models/question/questionModel'
import getQuiz from '@utils/getQuiz'
import { Types } from 'mongoose'
import isParticipant from '@utils/isParticipant'
import { checkQuizUserStatus, isQuizUserStatusValid } from '@utils/checkQuizUserStatus'

interface createOrUpdateResponseRequest extends Request {
  body: {
    user: JwtPayload
    selectedOptionId?: IResponse['selectedOptionId']
    subjectiveAnswer?: IResponse['subjectiveAnswer']
    status: IResponse['status']
  }
  params: {
    quizId: string
    questionId: string
  }
}

const createOrUpdateResponse = async (req: createOrUpdateResponseRequest, res: Response) => {
  if (!req.body || !req.body.status) {
    return sendInvalidInputResponse(res)
  }
  const { user, selectedOptionId, subjectiveAnswer, status } = req.body
  try {
    const question = await QuestionModel.findById(req.params.questionId)
    if (!question) {
      return sendInvalidInputResponse(res)
    }

    const quiz = await getQuiz(req.params.quizId)
    if (!quiz) {
      return sendInvalidInputResponse(res)
    }

    const userObjectId = new Types.ObjectId(user.userId)
    const dbUser = isParticipant(userObjectId, quiz?.participants)
    if (!dbUser) {
      return sendFailureResponse({
        res,
        error: 'Error fetching quiz, Invalid User',
        messageToSend: 'Error fetching quiz, User does not exist',
        errorCode: 400,
      })
    }

    const currentStatus: QuizUserStatus = checkQuizUserStatus(quiz, dbUser)
    if (!isQuizUserStatusValid(currentStatus, res)) {
      return
    }

    if (currentStatus === QuizUserStatus.autoSubmitQuiz) {
      dbUser.submitted = true
      await quiz.save()
      console.log('Auto submit quiz')
      return res.status(200).json({ message: 'Quiz auto submitted' })
    }

    const response = await ResponseModel.findOne({
      userId: user.userId,
      quizId: req.params.quizId,
      questionId: req.params.questionId,
    })
    if (!response) {
      const newResponse = new ResponseModel({
        userId: user.userId,
        quizId: req.params.quizId,
        questionId: req.params.questionId,
        subjectiveAnswer,
        selectedOptionId,
        status,
      })
      await newResponse.save()
      res.status(201).json({ message: 'Response created' })
    } else {
      await ResponseModel.findByIdAndUpdate(response._id, {
        selectedOptionId,
        subjectiveAnswer,
        status,
      })
      return res.status(200).json({ message: 'Response updated' })
    }
  } catch (error: unknown) {
    sendFailureResponse({
      res,
      error,
      messageToSend: 'Failed to create response',
    })
  }
}

export default createOrUpdateResponse
