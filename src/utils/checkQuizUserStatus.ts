import { Response } from 'express'
import { IQuiz, IParticipant, QuizUserStatus } from '../types/quiz'
import sendFailureResponse from './failureResponse'

const checkQuizUserStatus = (quiz: IQuiz, user: IParticipant): QuizUserStatus => {
  if (!quiz.isPublished) {
    return QuizUserStatus.quizNotStarted
  }
  if (!quiz.isAcceptingAnswers) {
    return QuizUserStatus.quizNotAcceptingAnswers
  }
  if (user.submitted) {
    return QuizUserStatus.submitted
  }
  if (user.startTime === 0) {
    return QuizUserStatus.userNotStarted
  }

  const currentTime = new Date().getTime()
  const quizDurationInMins = quiz?.quizMetadata?.duration as number
  const quizDurationInMs = quizDurationInMins * 60 * 1000
  const timeInQuiz = currentTime - user.startTime

  if (timeInQuiz >= quizDurationInMs) {
    return QuizUserStatus.autoSubmitQuiz
  }
  return QuizUserStatus.userIsGivingQuiz
}

const isQuizUserStatusValid = (currentStatus: QuizUserStatus, res: Response): boolean => {
  switch (currentStatus) {
    case QuizUserStatus.quizNotAcceptingAnswers:
      sendFailureResponse({
        res,
        errorCode: 400,
        error: new Error('Quiz not accepting answers'),
        messageToSend: 'Quiz not accepting answers',
      })
      return false
    case QuizUserStatus.quizNotStarted:
      sendFailureResponse({
        res,
        errorCode: 400,
        error: new Error('Quiz not started'),
        messageToSend: 'Quiz not started',
      })
      return false
    case QuizUserStatus.userNotStarted:
      sendFailureResponse({
        res,
        errorCode: 400,
        error: new Error('User has not started the quiz'),
        messageToSend: 'User has not started the quiz',
      })
      return false
    case QuizUserStatus.submitted:
      sendFailureResponse({
        res,
        errorCode: 400,
        error: new Error('User has already submitted the quiz'),
        messageToSend: 'User has already submitted the quiz',
      })
      return false
    case QuizUserStatus.autoSubmitQuiz:
      return true
    case QuizUserStatus.userIsGivingQuiz:
      return true
    default:
      sendFailureResponse({
        res,
        errorCode: 400,
        error: new Error('Invalid status'),
        messageToSend: 'Invalid status',
      })
      return false
  }
}

export { checkQuizUserStatus, isQuizUserStatusValid }
