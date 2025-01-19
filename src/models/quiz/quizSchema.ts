import { Schema } from 'mongoose'
import { ModelNames, IQuiz } from 'types'

const quizSchema = new Schema<IQuiz>({
  admin: {
    type: Schema.Types.ObjectId,
    ref: ModelNames.User,
    required: true,
  },
  managers: [
    {
      type: Schema.Types.ObjectId,
      ref: ModelNames.User,
    },
  ],
  participants: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User,
      },
      submitted: {
        type: Boolean,
        default: false,
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
              required: false,
            },
          },
        ],
      },

      startTime: {
        type: Number,
        default: 0,
      },
    },
  ],
  isPublished: {
    type: Boolean,
    required: true,
    default: false,
  },
  isAcceptingAnswers: {
    type: Boolean,
    required: true,
    default: false,
  },
  resultsPublished: {
    type: Boolean,
    required: true,
    default: false,
  },
  quizMetadata: {
    name: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    instructions: {
      type: String,
      required: false,
    },
    startDateTimestamp: {
      type: Date,
      required: false,
    },
    endDateTimestamp: {
      type: Date,
      required: false,
    },
    duration: {
      type: Number,
      required: false,
    },
    accessCode: {
      type: String,
    },
    bannerImage: {
      type: String,
      required: false,
    },
  },
  registrationMetadata: {
    customFields: [
      {
        name: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
        isRequired: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  sections: [
    {
      name: {
        type: String,
        required: true,
      },
      instructions: {
        type: String,
      },
      questions: [{ type: Schema.Types.ObjectId, ref: ModelNames.Question }],
    },
  ],
})

export default quizSchema
