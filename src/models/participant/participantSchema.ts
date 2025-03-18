import { Schema } from 'mongoose'
import { ModelNames, IParticipant } from 'types'

const participantSchema = new Schema<IParticipant>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: ModelNames.User,
    required: true,
  },
  quizId: {
    type: Schema.Types.ObjectId,
    ref: ModelNames.Quiz,
    required: true,
  },
  submitted: {
    type: Boolean,
    required: true,
    default: false
  },
  registrationData: {
    customFields: [
      {
        name: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: false, //TODO: Do sanity checking for required fields 
        },
      },
    ],
  },
  startTime: {
    type: Number,
    default: 0,
  },
})

export default participantSchema