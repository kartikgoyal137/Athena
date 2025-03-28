import { Types } from 'mongoose'
import ParticipantModel from '@models/participant/participantModel'

const isParticipant = async (userId: Types.ObjectId, quizId: Types.ObjectId) => {
  return await ParticipantModel.findOne({ userId, quizId });
}

export default isParticipant
