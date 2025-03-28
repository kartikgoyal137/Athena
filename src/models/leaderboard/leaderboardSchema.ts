import { Schema } from 'mongoose'
import { ModelNames, ILeaderboard } from 'types'

const leaderboardSchema = new Schema<ILeaderboard>({
  quizId: {
    type: Schema.Types.ObjectId,
    ref: ModelNames.Quiz,
    required: true,
  },
  sectionIndex: {
    type: Number,
    required: true,
  },
  participants: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
        required: true,
      },
      marks: {
        type: Number,
        required: true,
      },
      questionsAttempted: {
        type: Number,
        required: true,
      },
      questionsChecked: {
        type: Number,
        required: true,
      },
    },
  ],
})

export default leaderboardSchema
