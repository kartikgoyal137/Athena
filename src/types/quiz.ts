import { Date, Types } from 'mongoose'
import { IQuestion } from './question'
import { IUser } from './user'

export interface IQuiz {
  _id?: Types.ObjectId
  admin: IUser
  managers?: Types.ObjectId[]
  isPublished: boolean
  isAcceptingAnswers: boolean
  resultsPublished: boolean
  quizMetadata?: {
    name: string
    description: string
    instructions: string
    startDateTimestamp: Date
    endDateTimestamp: Date
    duration: number
    accessCode?: string
    bannerImage?: string
  }
  registrationMetadata?: {
    customFields: {
      name: string
      label: string
      isRequired: boolean
    }[]
  }
  sections?: {
    name: string
    instructions?: string
    questions?: IQuestion[]
  }[]
}

export enum QuizCode {
  JoinQuiz = 'joinQuiz',
  LeftQuiz = 'leftQuiz',
  ServerDisconnect = 'server namespace disconnect',
}

export enum QuizUserStatus {
  quizNotAcceptingAnswers,
  quizNotStarted,
  userNotStarted,
  userIsGivingQuiz,
  submitted,
  autoSubmitQuiz,
}
