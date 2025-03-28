import { Types } from 'mongoose'
import { IQuiz } from './quiz'

export interface IParticipant {
  userId: Types.ObjectId
  quizId: IQuiz
  submitted: boolean
  registrationData: {
    customFields: {
      name: string
      value: string
    }[]
  }
  startTime: number
}


