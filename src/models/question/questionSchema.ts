import { Schema } from 'mongoose'
import { ModelNames, IQuestion, QuestionTypes } from 'types'

const questionSchema = new Schema<IQuestion>({
  type: {
    type: String,
    required: true,
    enum: Object.values(QuestionTypes),
    default: QuestionTypes.SUB,
  },
  description: {
    type: String,
  },
  checkersNotes: {
    type: String,
  },
  options: [
    {
      id: {
        type: String,
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
    },
  ],
  correctAnswer: [
    {
      type: String,
      required: true,
    },
  ],
  maxMarks: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
  },
  autoCheck: {
    type: Boolean,
    required: true,
    default: false,
  },
  totalAttempts: {
    type: Number,
    default: 0,
  },
  checkedAttempts: {
    type: Number,
    default: 0,
  },
  assignedTo: [
    {
      type: Schema.Types.ObjectId,
      ref: ModelNames.User,
    },
  ],
})

export default questionSchema
