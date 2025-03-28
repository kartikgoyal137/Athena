import { Types } from 'mongoose'
//DONE
export interface ILeaderboard {
  _id?: Types.ObjectId
  quizId: Types.ObjectId
  sectionIndex: number
  participants: {
    userId: Types.ObjectId
    marks: number
    questionsAttempted: number
    questionsChecked: number
  }[]
}
