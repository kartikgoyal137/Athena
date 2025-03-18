import { Types } from 'mongoose'

export interface IParticipant {
  userId: Types.ObjectId
  quizId: Types.ObjectId
  submitted: boolean
  registrationData: {
    customFields: {
      name: string
      value: string
    }[]
  }
  startTime: number
}


