import { Response, Request } from 'express'
import ResponseModel from '@models/response/responseModel'
import { JwtPayload, IResponse, QuizUserStatus } from 'types'
import sendFailureResponse from '@utils/failureResponse'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import QuestionModel from '@models/question/questionModel'
import ParticipantModel from '@models/participant/participantModel'
import getQuiz from '@utils/getQuiz'
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

    const participant = await isParticipant(user.userId, quiz._id)
    if (!participant) {
      return sendFailureResponse({
        res,
        error: 'Error fetching quiz, Invalid User',
        messageToSend: 'Error fetching quiz, User does not exist',
        errorCode: 400,
      })
    }

    const currentStatus: QuizUserStatus = checkQuizUserStatus(quiz, participant)
    if (!isQuizUserStatusValid(currentStatus, res)) {
      return
    }

    if (currentStatus === QuizUserStatus.autoSubmitQuiz) {
      await ParticipantModel.updateOne(
        { quizId: quiz._id, userId: user.userId },
        {
          $set: { submitted: true },
        },
      )
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

      //here also increment the totalAttempts of the question
      await QuestionModel.findByIdAndUpdate(req.params.questionId, {
        $inc: { totalAttempts: 1 },
      })
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
